<template>
  <div class="ag-grid-wrapper" :style="{ fontFamily: content.fontFamily || 'Arial, sans-serif' }">
    <div 
      ref="agGridElement"
      class="ag-grid-container"
      :class="[gridThemeClass, { 'is-loading': gridState.isLoading }]"
      :style="gridCustomStyles"
    >
      <transition name="fade">
        <div v-if="gridState.isLoading" class="loading-overlay">
          <div class="loading-content">
            {{ content.loadingMessage || 'Updating...' }}
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { debounce } from 'lodash';
import { themeQuartz } from 'ag-grid-community';

export default {
  name: "CustomAgGrid",
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
    customTheme: { type: Object, required: false }
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    const agGridElement = ref(null);
    let gridApi = null;
    let gridColumnApi = null;
    let isUpdating = false;
    const MAX_RETRY = 3;
    const lastFailedUpdate = ref(null);

    // Use WeWeb helper variable for component state.
    let gridState;
    let setGridState;
    const defaultGridState = {
      lastUpdate: null,
      errorMessage: null,
      isLoading: false,
      scriptLoaded: false,
      cssLoaded: false,
      filterModel: null,
      sortModel: null
    };
    if (typeof wwLib !== 'undefined' && wwLib.wwVariable && typeof wwLib.wwVariable.useComponentVariable === 'function') {
      ({ value: gridState, setValue: setGridState } = wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'gridState',
        defaultValue: defaultGridState
      }));
    } else {
      gridState = ref(defaultGridState);
      setGridState = (val) => { gridState.value = val; };
    }
    
    // Compute legacy theme class based on "theme" property.
    const gridThemeClass = computed(() => `ag-theme-${props.content?.theme || 'quartz'}`);
    
    // Compute inline style overrides from theme properties.
    const gridCustomStyles = computed(() => ({
      '--ag-accent-color': props.content.accentColor || '#2196F3',
      '--ag-background-color': props.content.backgroundColor || '#FFFFFF',
      '--ag-header-background-color': props.content.headerBackgroundColor || '#F5F5F5',
      '--ag-header-text-color': props.content.headerTextColor || '#000000',
      '--ag-border-color': props.content.borderColor || '#E0E0E0',
      '--ag-row-border-color': props.content.borderColor || '#E0E0E0',
      width: '100%',
      height: '100%',
      'min-height': '400px'
    }));
    
    // Inject dynamic CSS overrides via a <style> element.
    function applyThemeOverrides() {
      const css = `
        /* Grid background override */
        .${gridThemeClass.value} .ag-root-wrapper {
          background-color: ${props.content.backgroundColor || '#FFFFFF'} !important;
        }
        /* Header background override */
        .${gridThemeClass.value} .ag-header {
          background-color: ${props.content.headerBackgroundColor || '#F5F5F5'} !important;
        }
        /* Header text override */
        .${gridThemeClass.value} .ag-header-cell,
        .${gridThemeClass.value} .ag-header-cell-label {
          color: ${props.content.headerTextColor || '#000000'} !important;
        }
        /* Border override */
        .${gridThemeClass.value} .ag-cell,
        .${gridThemeClass.value} .ag-row,
        .${gridThemeClass.value} .ag-header-cell,
        .${gridThemeClass.value} .ag-root-wrapper {
          border-color: ${props.content.borderColor || '#E0E0E0'} !important;
        }
        /* Accent color override */
        .${gridThemeClass.value} .ag-icon,
        .${gridThemeClass.value} .ag-action-icon,
        .${gridThemeClass.value} .ag-accent {
          color: ${props.content.accentColor || '#2196F3'} !important;
        }
        /* Selected row background override */
        ${props.content.selectedRowBackgroundColor ? `
          .${gridThemeClass.value} .ag-row-selected {
            background-color: ${props.content.selectedRowBackgroundColor} !important;
          }
        ` : ''}
      `;
      let styleEl = document.getElementById('custom-theme-overrides');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'custom-theme-overrides';
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = css;
    }
    
    // Watch for changes in theme properties and reapply overrides.
    watch(() => [
      props.content.accentColor,
      props.content.backgroundColor,
      props.content.headerBackgroundColor,
      props.content.headerTextColor,
      props.content.borderColor,
      props.content.selectedRowBackgroundColor
    ], applyThemeOverrides, { immediate: true });
    
    // Compute active theme using AG Grid theming API.
    const activeTheme = computed(() => {
      if (props.customTheme && typeof props.customTheme.withParams === 'function') {
        return props.customTheme;
      }
      if (props.content && props.content.themeParams && Object.keys(props.content.themeParams).length > 0) {
        return themeQuartz.withParams(props.content.themeParams);
      }
      return themeQuartz;
    });
    
    // Process column definitions for custom formatting.
    const processedColumnDefs = computed(() => {
      const cols = props.content?.columnDefs || [];
      return cols.map(colDef => {
        const newColDef = { ...colDef };
        switch (newColDef.dataType) {
          case 'timestamp':
            newColDef.valueFormatter = params => {
              if (!params.value) return '';
              return new Date(params.value).toLocaleString();
            };
            break;
          case 'boolean':
            newColDef.valueFormatter = params => (params.value ? 'Yes' : 'No');
            break;
          case 'checkbox':
            newColDef.cellEditor = 'agCheckboxCellEditor';
            break;
          case 'dropdown':
            newColDef.cellEditor = 'agSelectCellEditor';
            if (newColDef.dropdownOptions && Array.isArray(newColDef.dropdownOptions)) {
              newColDef.cellEditorParams = { values: newColDef.dropdownOptions };
            }
            break;
          default:
          // Default text formatting: nothing extra.
        }
        return newColDef;
      });
    });
    
    // Debounced update to preserve grid state.
    const debouncedGridUpdate = debounce((operation, showLoadingOverlay = false) => {
      if (!gridApi) return;
      if (showLoadingOverlay) setGridState({ ...gridState.value, isLoading: true });
      const currentFilterModel = gridApi.getFilterModel();
      const currentSortModel = gridColumnApi.getColumnState();
      operation();
      setTimeout(() => {
        if (gridApi && currentFilterModel) gridApi.setFilterModel(currentFilterModel);
        if (gridColumnApi && currentSortModel) gridColumnApi.applyColumnState({ state: currentSortModel });
        if (showLoadingOverlay) {
          setGridState({
            ...gridState.value,
            isLoading: false,
            filterModel: currentFilterModel,
            sortModel: currentSortModel
          });
        }
      }, 100);
    }, 150);
    
    // Load AG Grid resources.
    function loadAgGridResources() {
      console.log('Loading AG Grid resources');
      if (!window.__agGridResourcesLoaded) {
        window.__agGridResourcesLoaded = true;
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.3/dist/ag-grid-community.min.noStyle.js';
        document.body.appendChild(script);
        const styleGrid = document.createElement('link');
        styleGrid.rel = 'stylesheet';
        styleGrid.href = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.3/styles/ag-grid.css';
        document.head.appendChild(styleGrid);
      }
      // Only load legacy theme CSS if no custom theme parameters or customTheme is provided.
      if (!(props.content.themeParams && Object.keys(props.content.themeParams).length > 0) && !props.customTheme) {
        const themeName = props.content?.theme || 'quartz';
        const existingThemeLink = document.querySelector('link[data-ag-theme]');
        if (existingThemeLink) existingThemeLink.parentNode.removeChild(existingThemeLink);
        const styleTheme = document.createElement('link');
        styleTheme.rel = 'stylesheet';
        styleTheme.href = `https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.3/styles/ag-theme-${themeName}.css`;
        styleTheme.setAttribute('data-ag-theme', themeName);
        document.head.appendChild(styleTheme);
      }
    }
    
    // Initialize AG Grid.
    function initializeAgGrid() {
      if (!window.agGrid) {
        console.warn('AG Grid not loaded yet, retrying...');
        return;
      }
      const gridDiv = agGridElement.value;
      if (!gridDiv) {
        console.warn('Grid element not found');
        return;
      }
      console.log('Initializing AG Grid');
      const gridOptions = {
        columnDefs: processedColumnDefs.value,
        defaultColDef: {
          editable: true,
          sortable: props.content?.enableSorting ?? true,
          filter: props.content?.enableFiltering ?? true,
          resizable: true,
          minWidth: 150,
          autoHeight: true,
          wrapText: true,
          suppressKeyboardEvent: params => gridState.isLoading,
          filterParams: {
            debounceMs: 200,
            suppressAndOrCondition: true,
            newRowsAction: 'keep'
          }
        },
        rowData: props.content?.tableData || [],
        pagination: true,
        paginationPageSize: props.content?.pageSize || 25,
        rowSelection: 'multiple',
        enableRangeSelection: true,
        domLayout: 'autoHeight',
        animateRows: true,
        rowHeight: props.content?.rowHeight || 25,
        onGridReady: (params) => {
          gridApi = params.api;
          gridColumnApi = params.columnApi;
          if (gridState.filterModel) gridApi.setFilterModel(gridState.filterModel);
          if (gridState.sortModel) gridColumnApi.applyColumnState({ state: gridState.sortModel });
          // Auto-size columns if enabled.
          if (props.content.autoSizeColumns) {
            params.api.sizeColumnsToFit();
          }
        },
        onFilterChanged: () => {
          if (!gridApi) return;
          const newFilterModel = gridApi.getFilterModel();
          gridApi.redrawRows();
          setGridState({ ...gridState.value, filterModel: newFilterModel });
        },
        onSortChanged: () => {
          if (!gridColumnApi) return;
          const newSortModel = gridColumnApi.getColumnState();
          setGridState({ ...gridState.value, sortModel: newSortModel });
        },
        onCellValueChanged: handleCellValueChanged,
        onRowSelected: (event) => {
          if (event.node.isSelected()) {
            emit('trigger-event', {
              name: 'rowSelected',
              event: { rowData: event.data }
            });
          }
        },
        theme: activeTheme.value
      };
      
      try {
        if (typeof window.agGrid.createGrid === 'function') {
          window.agGrid.createGrid(agGridElement.value, gridOptions);
        } else if (typeof window.agGrid.Grid === 'function') {
          new window.agGrid.Grid(agGridElement.value, gridOptions);
        } else {
          throw new Error('AG Grid initialization method not found');
        }
        console.log('Grid initialized successfully');
      } catch (error) {
        console.error('Failed to initialize grid:', error);
        setGridState({ ...gridState.value, errorMessage: 'Failed to initialize grid' });
        emit('trigger-event', {
          name: 'error',
          event: { message: 'Failed to initialize grid', type: 'error' }
        });
      }
    }
    
    const handleCellValueChanged = async (event) => {
      if (!props.content?.xanoEndpoint || isUpdating || gridState.isLoading) return;
      const updatedData = { ...event.data };
      const originalValue = event.oldValue;
      const field = event.column.colId;
      isUpdating = true;
      try {
        setGridState({ ...gridState.value, isLoading: true });
        emit('trigger-event', { name: 'updateStart', event: { rowData: updatedData } });
        const headers = {
          'Content-Type': 'application/json',
          ...(props.content.xanoHeaders || {})
        };
        const response = await fetch(props.content.xanoEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(updatedData)
        });
        if (!response.ok) throw new Error(`Update failed: ${response.statusText}`);
        const result = await response.json();
        emit('trigger-event', {
          name: 'cellValueChanged',
          event: { field, oldValue: originalValue, newValue: event.newValue, rowData: result }
        });
        setGridState({ ...gridState.value, lastUpdate: new Date(), isLoading: false });
      } catch (error) {
        event.node.setDataValue(field, originalValue);
        setGridState({ ...gridState.value, errorMessage: error.message || 'Update failed', isLoading: false });
        emit('trigger-event', { name: 'error', event: { message: error.message || 'Update failed', type: 'error' } });
      } finally {
        isUpdating = false;
      }
    };
    
    watch(() => props.content?.tableData, (newData) => {
      if (gridApi && newData && !isUpdating) {
        debouncedGridUpdate(() => gridApi.setRowData(newData));
      }
    }, { deep: true });
    
    watch(() => props.content?.pageSize, (newSize) => {
      if (gridApi && newSize) {
        debouncedGridUpdate(() => gridApi.paginationSetPageSize(newSize));
      }
    });
    
    const refreshData = () => {
      if (gridApi) {
        debouncedGridUpdate(() => gridApi.refreshCells({ force: true }));
      }
    };
    const exportToCSV = () => {
      if (gridApi) {
        gridApi.exportDataAsCsv({
          fileName: `export-${new Date().toISOString().split('T')[0]}.csv`
        });
      }
    };
    const clearSelection = () => {
      if (gridApi) {
        debouncedGridUpdate(() => gridApi.deselectAll());
      }
    };
    const retryUpdate = async () => {
      if (lastFailedUpdate.value) {
        if (lastFailedUpdate.value.retryCount > MAX_RETRY) {
          console.error('Maximum retry attempts reached.');
          emit('trigger-event', { name: 'error', event: { message: 'Maximum retry attempts reached', type: 'error' } });
          return;
        }
        const { eventData, originalValue, field } = lastFailedUpdate.value;
        await attemptUpdate({ ...eventData.data }, originalValue, field, eventData);
      }
    };
    
    onMounted(() => {
      console.log('Vue component mounted');
      loadAgGridResources();
      applyThemeOverrides();
      const checkInterval = setInterval(() => {
        if (window.agGrid) {
          clearInterval(checkInterval);
          setGridState({ ...gridState.value, scriptLoaded: true });
          initializeAgGrid();
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 5000);
    });
    
    onBeforeUnmount(() => {
      if (gridApi) gridApi.destroy();
      const styleEl = document.getElementById('custom-theme-overrides');
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
      const legacyThemeLink = document.querySelector('link[data-ag-theme]');
      if (legacyThemeLink && legacyThemeLink.parentNode) {
        legacyThemeLink.parentNode.removeChild(legacyThemeLink);
      }
    });
    
    return {
      agGridElement,
      gridState,
      gridThemeClass,
      gridCustomStyles,
      refreshData,
      exportToCSV,
      clearSelection,
      retryUpdate
    };
  }
};
</script>
  
<style lang="scss" scoped>
.ag-grid-wrapper {
  width: 100%;
  height: 100%;
  min-height: 400px;
  position: relative;
  overflow: hidden;
}
.ag-grid-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
  &.is-loading {
    pointer-events: none;
    opacity: 0.7;
    transition: opacity 0.3s ease-in-out;
  }
}
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.loading-content {
  background: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

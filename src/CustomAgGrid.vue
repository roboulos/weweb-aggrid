<template>
    <div class="ag-grid-wrapper" :style="{ fontFamily: content.fontFamily }">
      <div 
        ref="agGridElement"
        class="ag-grid-container"
        :class="[gridThemeClass, { 'is-loading': gridState.isLoading }]"
        :style="[gridCustomStyles, { height: '100%', width: '100%' }]"
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
  import 'ag-grid-community/styles/ag-grid.css';
  import 'ag-grid-community/styles/ag-theme-quartz.css';
  import { Grid, themeQuartz } from 'ag-grid-community';
  // Import the default AG Grid theme (Quartz) for use in theme composition
  
  export default {
    props: {
      content: { type: Object, required: true },
      uid: { type: String, required: true },
      // New prop: allow passing a custom AG Grid theme object (e.g., generated from the Theme Builder)
      customTheme: { type: Object, required: false },
      /* wwEditor:start */
      wwEditorState: { type: Object, required: true },
      /* wwEditor:end */
    },
    emits: ['trigger-event'],
    setup(props, { emit }) {
      const agGridElement = ref(null);
      let gridApi = null;
      let gridColumnApi = null;
      let isUpdating = false;
      const MAX_RETRY = 3;
      const lastFailedUpdate = ref(null);
  
      // Component state variable (using a WeWeb helper)
      const { value: gridState, setValue: setGridState } = wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'gridState',
        defaultValue: {
          lastUpdate: null,
          errorMessage: null,
          isLoading: false,
          scriptLoaded: false,
          cssLoaded: false,
          currentTheme: null,
          filterModel: null,
          sortModel: null
        }
      });
  
      // Compute custom grid styles based on theme parameters
      const gridCustomStyles = computed(() => ({
        '--ag-accent-color': props.content.accentColor || '#2196F3',
        '--ag-background-color': props.content.backgroundColor || '#FFFFFF',
        '--ag-header-background-color': props.content.headerBackgroundColor || '#F5F5F5',
        '--ag-header-foreground-color': props.content.headerTextColor || '#000000',
        '--ag-border-color': props.content.borderColor || '#E0E0E0',
        '--ag-row-border-color': props.content.borderColor || '#E0E0E0',
      }));

      // Compute active theme by merging with themeQuartz
      const activeTheme = computed(() => ({
        ...themeQuartz,
        vars: {
          ...themeQuartz.vars,
          backgroundColor: props.content.backgroundColor || '#FFFFFF',
          headerBackgroundColor: props.content.headerBackgroundColor || '#F5F5F5',
          headerForegroundColor: props.content.headerTextColor || '#000000',
          borderColor: props.content.borderColor || '#E0E0E0',
        }
      }));

      // Legacy class for fallback CSS themes
      const gridThemeClass = computed(() => {
        return props.content?.themeClass || `ag-theme-${props.content?.theme || 'quartz'}`;
      });
  
      // Process column definitions to add formatting/editors based on dataType
      const processedColumnDefs = computed(() => {
        const cols = props.content?.columnDefs || [];
        return cols.map(colDef => {
          const newColDef = { ...colDef };
          switch (newColDef.dataType) {
            case 'timestamp':
              newColDef.valueFormatter = params => {
                if (!params.value) return '';
                const date = new Date(params.value);
                return date.toLocaleString();
              };
              break;
            case 'boolean':
              newColDef.valueFormatter = params => params.value ? 'Yes' : 'No';
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
            // default handling (text)
          }
          return newColDef;
        });
      });
  
      // Debounced grid update that preserves filter/sort state
      const debouncedGridUpdate = debounce((operation, showLoadingOverlay = false) => {
        if (!gridApi) return;
        if (showLoadingOverlay) {
          setGridState({ ...gridState.value, isLoading: true });
        }
        const currentFilterModel = gridApi.getFilterModel();
        const currentSortModel = gridColumnApi.getColumnState();
        operation();
        setTimeout(() => {
          if (gridApi && currentFilterModel) {
            gridApi.setFilterModel(currentFilterModel);
          }
          if (gridColumnApi && currentSortModel) {
            gridColumnApi.applyColumnState({ state: currentSortModel });
          }
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
  
      // Load AG Grid resources (scripts and CSS)
      function loadAgGridResources() {
        console.log('Loading AG Grid resources');
        // No need to load resources dynamically since we're importing them
        setGridState({ ...gridState.value, scriptLoaded: true, cssLoaded: true });
      }
  
      // Initialize AG Grid with the active theme passed via gridOptions
      function initializeAgGrid() {
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
            suppressKeyboardEvent: params => gridState.value.isLoading,
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
            if (gridState.value.filterModel) {
              gridApi.setFilterModel(gridState.value.filterModel);
            }
            if (gridState.value.sortModel) {
              gridColumnApi.applyColumnState({ state: gridState.value.sortModel });
            }
            // Auto-size columns after grid is ready
            params.api.sizeColumnsToFit();
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
          // Pass the active theme object as the grid theme option
          theme: activeTheme.value
        };
  
        try {
          new Grid(gridDiv, gridOptions);
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
  
      // Reusable function to attempt updates with retry logic
      const attemptUpdate = async (updatedData, originalValue, field, eventData) => {
        try {
          setGridState({ ...gridState.value, isLoading: true, errorMessage: null });
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
            event: { field, oldValue: originalValue, newValue: eventData.newValue, rowData: result }
          });
          setGridState({ ...gridState.value, lastUpdate: new Date(), isLoading: false });
          lastFailedUpdate.value = null;
        } catch (error) {
          eventData.node.setDataValue(field, originalValue);
          if (!lastFailedUpdate.value) {
            lastFailedUpdate.value = { eventData, originalValue, field, retryCount: 1 };
          } else {
            lastFailedUpdate.value.retryCount++;
          }
          setGridState({ ...gridState.value, errorMessage: error.message || 'Update failed', isLoading: false });
          emit('trigger-event', { name: 'error', event: { message: error.message || 'Update failed', type: 'error' } });
        } finally {
          isUpdating = false;
        }
      };
  
      // Handle cell value changes
      const handleCellValueChanged = async (event) => {
        if (!props.content?.xanoEndpoint || isUpdating || gridState.value.isLoading) return;
        const updatedData = { ...event.data };
        const originalValue = event.oldValue;
        const field = event.column.colId;
        isUpdating = true;
        await attemptUpdate(updatedData, originalValue, field, event);
      };
  
      // Retry the last failed update if any
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
  
      // Sample data fallback
      const getSampleData = () => ([
        { id: 1, name: 'Sample Item 1', description: 'Description 1', status: 'Active' },
        { id: 2, name: 'Sample Item 2', description: 'Description 2', status: 'Pending' },
        { id: 3, name: 'Sample Item 3', description: 'Description 3', status: 'Active' }
      ]);
  
      // Watch for changes in tableData or pageSize
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
  
      onMounted(() => {
        console.log('Vue component mounted');
        loadAgGridResources();
        // Wait for AG Grid to be available (max 5 seconds)
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
        const themeLink = document.querySelector('link[data-ag-theme]');
        if (themeLink && themeLink.parentNode) {
          themeLink.parentNode.removeChild(themeLink);
        }
      });
  
      return {
        agGridElement,
        gridState,
        gridThemeClass,
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
    display: flex;
    flex-direction: column;
  }
  
  .ag-grid-container {
    flex: 1;
    width: 100%;
    min-height: 400px;
    position: relative;
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
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  </style>
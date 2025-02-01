<template>
    <div class="ag-grid-wrapper" :style="{ fontFamily: content.fontFamily }">
      <div 
        ref="agGridElement"
        class="ag-grid-container"
        :class="[gridThemeClass, { 'is-loading': gridState.isLoading }]"
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
  
  export default {
    props: {
      content: { type: Object, required: true },
      uid: { type: String, required: true },
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
      const MAX_RETRY = 3; // maximum update retries
  
      // Store details of the last failed update (if any)
      const lastFailedUpdate = ref(null);
  
      // Component state using a WeWeb helper variable (for example purposes)
      const { value: gridState, setValue: setGridState } = wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'gridState',
        defaultValue: {
          lastUpdate: null,
          errorMessage: null,
          isLoading: false,
          lastFailedUpdate: null,
          scriptLoaded: false,
          cssLoaded: false,
          currentTheme: null,
          filterModel: null,
          sortModel: null
        }
      });
  
      // Computed class for the AG Grid theme
      const gridThemeClass = computed(() => 
        `ag-theme-${props.content?.theme || 'quartz'}`
      );
  
      // Default column definitions for AG Grid
      const defaultColDef = computed(() => ({
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
      }));
  
      // Process column definitions to add custom formatting/editors based on dataType
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
              // Optionally you might add a cellRenderer if desired
              break;
            case 'dropdown':
              newColDef.cellEditor = 'agSelectCellEditor';
              if (newColDef.dropdownOptions && Array.isArray(newColDef.dropdownOptions)) {
                newColDef.cellEditorParams = { values: newColDef.dropdownOptions };
              }
              break;
            // default is text; no extra formatting required
          }
          return newColDef;
        });
      });
  
      // Debounced grid update function (preserves filter/sort state)
      const debouncedGridUpdate = debounce((operation, showLoadingOverlay = false) => {
        if (!gridApi) return;
  
        if (showLoadingOverlay) {
          setGridState({ ...gridState.value, isLoading: true });
        }
  
        // Store current state
        const currentFilterModel = gridApi.getFilterModel();
        const currentSortModel = gridColumnApi.getColumnState();
  
        // Execute operation
        operation();
  
        // Restore state after a short delay
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
  
      // Function to load AG Grid resources
      function loadAgGridResources(theme) {
        console.log('Loading AG Grid resources for theme:', theme);
  
        // Load main AG Grid script if not already loaded
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
  
        // Remove any previous theme stylesheet
        const existingThemeLink = document.querySelector('link[data-ag-theme]');
        if (existingThemeLink) {
          existingThemeLink.parentNode.removeChild(existingThemeLink);
        }
  
        // Load the new theme stylesheet
        const styleTheme = document.createElement('link');
        styleTheme.rel = 'stylesheet';
        styleTheme.href = `https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.3/styles/ag-theme-${theme}.css`;
        styleTheme.setAttribute('data-ag-theme', theme);
        document.head.appendChild(styleTheme);
      }
  
      // Initialize AG Grid
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
          defaultColDef: defaultColDef.value,
          rowData: props.content?.tableData || getSampleData(),
          pagination: true,
          paginationPageSize: props.content?.pageSize || 25,
          rowSelection: 'multiple',
          enableRangeSelection: true,
          enableCellChangeFlash: true,
          suppressPropertyNamesCheck: true,
          domLayout: 'autoHeight',
          animateRows: true,
          maintainFilterStateOnDataChange: true,
          suppressFlashOnCellValueChange: true,
          // Set the row height if provided
          rowHeight: props.content?.rowHeight || 25,
  
          onGridReady: (params) => {
            console.log('Grid is ready');
            gridApi = params.api;
            gridColumnApi = params.columnApi;
  
            if (gridState.value.filterModel) {
              gridApi.setFilterModel(gridState.value.filterModel);
            }
            if (gridState.value.sortModel) {
              gridColumnApi.applyColumnState({ state: gridState.value.sortModel });
            }
          },
  
          onFilterChanged: () => {
            if (!gridApi) return;
            const newFilterModel = gridApi.getFilterModel();
            gridApi.redrawRows();
            setGridState({
              ...gridState.value,
              filterModel: newFilterModel
            });
          },
  
          onSortChanged: () => {
            if (!gridColumnApi) return;
            const newSortModel = gridColumnApi.getColumnState();
            setGridState({
              ...gridState.value,
              sortModel: newSortModel
            });
          },
  
          onCellValueChanged: handleCellValueChanged,
  
          onRowSelected: (event) => {
            if (event.node.isSelected()) {
              emit('trigger-event', {
                name: 'rowSelected',
                event: { rowData: event.data }
              });
            }
          }
        };
  
        try {
          if (typeof window.agGrid.createGrid === 'function') {
            window.agGrid.createGrid(gridDiv, gridOptions);
          } else if (typeof window.agGrid.Grid === 'function') {
            new window.agGrid.Grid(gridDiv, gridOptions);
          } else {
            throw new Error('AG Grid initialization method not found');
          }
          console.log('Grid initialized successfully');
        } catch (error) {
          console.error('Failed to initialize grid:', error);
          // Try alternative initialization after a short delay
          setTimeout(() => {
            try {
              const GridClass = window.agGrid.Grid || window.agGrid;
              new GridClass(gridDiv, gridOptions);
              console.log('Grid initialized successfully using alternative method');
            } catch (retryError) {
              console.error('Failed to initialize grid after retry:', retryError);
              emit('trigger-event', {
                name: 'error',
                event: {
                  message: 'Failed to initialize grid',
                  type: 'error'
                }
              });
            }
          }, 100);
        }
      }
  
      const initializeGrid = async () => {
        if (!agGridElement.value) return;
  
        try {
          const theme = props.content?.theme || 'quartz';
          loadAgGridResources(theme);
          setGridState({ ...gridState.value, cssLoaded: true, currentTheme: theme });
  
          // Wait for AG Grid to be available (max 5 seconds)
          const checkInterval = setInterval(() => {
            if (window.agGrid) {
              clearInterval(checkInterval);
              setGridState({ ...gridState.value, scriptLoaded: true });
              initializeAgGrid();
            }
          }, 100);
  
          setTimeout(() => clearInterval(checkInterval), 5000);
        } catch (error) {
          console.error('Failed to initialize AG Grid:', error);
          setGridState({
            ...gridState.value,
            errorMessage: 'Failed to initialize grid'
          });
          emit('trigger-event', {
            name: 'error',
            event: {
              message: 'Failed to initialize grid',
              type: 'error'
            }
          });
        }
      };
  
      // Reusable function to attempt an update
      const attemptUpdate = async (updatedData, originalValue, field, eventData) => {
        try {
          setGridState({
            ...gridState.value,
            isLoading: true,
            errorMessage: null
          });
          emit('trigger-event', {
            name: 'updateStart',
            event: { rowData: updatedData }
          });
  
          const headers = {
            'Content-Type': 'application/json',
            ...(props.content.xanoHeaders || {})
          };
  
          const response = await fetch(props.content.xanoEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(updatedData)
          });
  
          if (!response.ok) {
            throw new Error(`Update failed: ${response.statusText}`);
          }
  
          const result = await response.json();
  
          emit('trigger-event', {
            name: 'cellValueChanged',
            event: {
              field,
              oldValue: originalValue,
              newValue: eventData.newValue,
              rowData: result
            }
          });
  
          setGridState({
            ...gridState.value,
            lastUpdate: new Date(),
            isLoading: false,
            errorMessage: null
          });
          // Clear any stored failed update on success
          lastFailedUpdate.value = null;
        } catch (error) {
          // Revert the cell change on error
          eventData.node.setDataValue(field, originalValue);
  
          // Store/update the failed update details for retry (limit to MAX_RETRY)
          if (!lastFailedUpdate.value) {
            lastFailedUpdate.value = { eventData, originalValue, field, retryCount: 1 };
          } else {
            lastFailedUpdate.value.retryCount++;
          }
  
          setGridState({
            ...gridState.value,
            errorMessage: error.message || 'Update failed',
            isLoading: false
          });
  
          emit('trigger-event', {
            name: 'error',
            event: {
              message: error.message || 'Update failed',
              type: 'error'
            }
          });
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
  
      // Retry the last failed update (if any) up to MAX_RETRY times
      const retryUpdate = async () => {
        if (lastFailedUpdate.value) {
          if (lastFailedUpdate.value.retryCount > MAX_RETRY) {
            console.error('Maximum retry attempts reached.');
            emit('trigger-event', {
              name: 'error',
              event: {
                message: 'Maximum retry attempts reached',
                type: 'error'
              }
            });
            return;
          }
          const { eventData, originalValue, field } = lastFailedUpdate.value;
          await attemptUpdate({ ...eventData.data }, originalValue, field, eventData);
        }
      };
  
      // Provide some sample data if none is provided
      const getSampleData = () => ([
        { id: 1, name: 'Sample Item 1', description: 'Description 1', status: 'Active' },
        { id: 2, name: 'Sample Item 2', description: 'Description 2', status: 'Pending' },
        { id: 3, name: 'Sample Item 3', description: 'Description 3', status: 'Active' }
      ]);
  
      // Watchers to update grid when data or page size changes
      watch(() => props.content?.tableData, (newData) => {
        if (gridApi && newData && !isUpdating) {
          debouncedGridUpdate(() => {
            gridApi.setRowData(newData);
          });
        }
      }, { deep: true });
  
      watch(() => props.content?.pageSize, (newSize) => {
        if (gridApi && newSize) {
          debouncedGridUpdate(() => {
            gridApi.paginationSetPageSize(newSize);
          });
        }
      });
  
      const refreshData = () => {
        if (gridApi) {
          debouncedGridUpdate(() => {
            gridApi.refreshCells({ force: true });
          });
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
          debouncedGridUpdate(() => {
            gridApi.deselectAll();
          });
        }
      };
  
      onMounted(() => {
        console.log('Vue component mounted');
        initializeGrid();
      });
  
      onBeforeUnmount(() => {
        if (gridApi) {
          gridApi.destroy();
        }
        // Remove any dynamically added theme links if needed
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
    overflow: hidden;
  }
  
  .ag-grid-container {
    width: 100%;
    height: 100%;
    min-height: inherit;
    position: relative;
    overflow: auto;
  
    &.is-loading {
      pointer-events: none;
      opacity: 0.7;
      transition: opacity 0.3s ease-in-out;
    }
  
    :deep(.ag-root-wrapper) {
      border: none;
    }
  
    :deep(.ag-header) {
      border-bottom: 1px solid #ddd;
    }
  
    :deep(.ag-cell) {
      padding: 8px;
      line-height: 1.4;
    }
  
    :deep(.ag-header-cell) {
      padding: 8px;
    }
  
    :deep(.ag-row) {
      transition: background-color 0.3s ease;
    }
  
    :deep(.ag-row-hover) {
      background-color: rgba(0, 0, 0, 0.02);
    }
  
    :deep(.ag-overlay) {
      transition: opacity 0.3s ease-in-out;
    }
  
    :deep(.ag-overlay-loading-wrapper) {
      background-color: rgba(255, 255, 255, 0.5);
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  
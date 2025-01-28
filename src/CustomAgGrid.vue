<template>
    <div class="ag-grid-wrapper">
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
        let currentThemeLinks = [];
        let currentFilterModel = null;
        let currentSortModel = null;
  
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
  
        const gridThemeClass = computed(() => 
            `ag-theme-${props.content?.theme || 'quartz'}`
        );
  
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
  
        const debouncedGridUpdate = debounce((operation, showLoadingOverlay = false) => {
            if (!gridApi) return;
  
            if (showLoadingOverlay) {
                setGridState({ ...gridState.value, isLoading: true });
            }
  
            // Store current state
            currentFilterModel = gridApi.getFilterModel();
            currentSortModel = gridColumnApi.getColumnState();
  
            // Execute operation
            operation();
  
            // Restore state after a brief delay
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
  
        // Function to load AG Grid resources dynamically
        function loadAgGridResources(theme) {
            console.log('Loading AG Grid resources for theme:', theme);
            // Ensure resources are loaded only once
            if (!window.__agGridResourcesLoaded) {
                window.__agGridResourcesLoaded = true;

                // Load main AG Grid script
                console.log('Loading AG Grid script');
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.3/dist/ag-grid-community.min.js';
                document.body.appendChild(script);

                // Load AG Grid base styles
                console.log('Loading AG Grid base styles');
                const styleGrid = document.createElement('link');
                styleGrid.rel = 'stylesheet';
                styleGrid.href = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.3/styles/ag-grid.css';
                document.head.appendChild(styleGrid);
            }

            // Remove any existing theme styles
            console.log('Removing existing theme styles');
            const existingThemeLink = document.querySelector('link[data-ag-theme]');
            if (existingThemeLink) {
                existingThemeLink.parentNode.removeChild(existingThemeLink);
            }

            // Load the selected theme
            console.log('Loading selected theme:', theme);
            const styleTheme = document.createElement('link');
            styleTheme.rel = 'stylesheet';
            styleTheme.href = `https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.3/styles/ag-theme-${theme}.css`;
            styleTheme.setAttribute('data-ag-theme', theme);
            document.head.appendChild(styleTheme);
        }

        // Ensure AG Grid is loaded before initializing the grid
        function initializeAgGrid() {
            document.addEventListener('DOMContentLoaded', function() {
                console.log('DOM fully loaded and parsed');
                const gridDiv = agGridElement.value; // Select the grid container element
                if (window.agGrid) { // Check if AG Grid library is loaded
                    console.log('AG Grid library loaded successfully');
                    const gridOptions = {
                        columnDefs: props.content?.columnDefs || [],
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
  
                            // Temporarily comment out sizeColumnsToFit to test column width settings
                            // params.api.sizeColumnsToFit({
                            //     defaultMinWidth: 150,
                            //     padding: 20
                            // });
  
                            setTimeout(() => {
                                // params.api.sizeColumnsToFit({
                                //     defaultMinWidth: 150,
                                //     padding: 20
                                // });
                            }, 100);
  
                            const resizeObserver = new ResizeObserver(() => {
                                if (gridApi) {
                                    // gridApi.sizeColumnsToFit({
                                    //     defaultMinWidth: 150,
                                    //     padding: 20
                                    // });
                                }
                            });
                            // resizeObserver.observe(agGridElement.value);
                            // resizeObserver.disconnect();
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
  
                    console.log('Initializing AG Grid with options:', gridOptions);
                    new agGrid.Grid(gridDiv, gridOptions); // Initialize the grid
                } else {
                    console.error('AG Grid library is not loaded'); // Error handling if AG Grid is not loaded
                }
            });
        }

        const initializeGrid = async () => {
            if (!agGridElement.value) return;
  
            try {
                const theme = props.content?.theme || 'quartz';
                loadAgGridResources(theme);
                setGridState({ ...gridState.value, cssLoaded: true, currentTheme: theme });
  
                const agGrid = await new Promise(resolve => {
                    const intervalId = setInterval(() => {
                        if (window.agGrid) {
                            clearInterval(intervalId);
                            resolve(window.agGrid);
                        }
                    }, 100);
                });
                setGridState({ ...gridState.value, scriptLoaded: true });
  
                initializeAgGrid();
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
  
        const handleCellValueChanged = async (event) => {
            if (!props.content?.xanoEndpoint || isUpdating || gridState.value.isLoading) return;
  
            const updatedData = { ...event.data };
            const originalValue = event.oldValue;
            const field = event.column.colId;
            
            try {
                isUpdating = true;
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
                        newValue: event.newValue,
                        rowData: result
                    }
                });
  
                setGridState({
                    ...gridState.value,
                    lastUpdate: new Date(),
                    isLoading: false,
                    lastFailedUpdate: null
                });
  
            } catch (error) {
                event.node.setDataValue(field, originalValue);
                
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
  
        const getSampleData = () => ([
            { id: 1, name: 'Sample Item 1', description: 'Description 1', status: 'Active' },
            { id: 2, name: 'Sample Item 2', description: 'Description 2', status: 'Pending' },
            { id: 3, name: 'Sample Item 3', description: 'Description 3', status: 'Active' }
        ]);
  
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
            initializeGrid();
        });
  
        onBeforeUnmount(() => {
            if (gridApi) {
                gridApi.destroy();
            }
            currentThemeLinks.forEach(link => {
                if (link && link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            });
        });
  
        return {
            agGridElement,
            gridState,
            gridThemeClass,
            refreshData,
            exportToCSV,
            clearSelection
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
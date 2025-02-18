<template>
  <div class="ag-grid-wrapper" :style="{ fontFamily: content?.fontFamily || 'Arial, sans-serif' }">
  <div 
  ref="agGridElement"
  class="ag-grid-container"
  :class="[gridThemeClass, { 'is-loading': gridState.isLoading }]"
  :style="gridCustomStyles"
  >
  <transition name="fade">
  <div v-if="gridState.isLoading" class="loading-overlay">
  <div class="loading-content">
  {{ content?.loadingMessage || 'Updating...' }}
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
  name: "CustomAgGrid",
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
  
  // Grid state management
  const { value: gridState, setValue: setGridState } = (typeof wwLib !== 'undefined' ? wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'gridState',
  defaultValue: {
  isLoading: false,
  scriptLoaded: false,
  cssLoaded: false,
  filterModel: null,
  sortModel: null
  }
  }) : { value: {}, setValue: () => {} });
  
  // Compute theme class
  const gridThemeClass = computed(() => `ag-theme-${props.content?.theme || 'quartz'}`);
  
  // Compute styles with proper null checks
  const gridCustomStyles = computed(() => ({
  '--ag-accent-color': props.content?.accentColor || '#2196F3',
  '--ag-background-color': props.content?.backgroundColor || '#FFFFFF',
  '--ag-header-background-color': props.content?.headerBackgroundColor || '#F5F5F5',
  '--ag-header-text-color': props.content?.headerTextColor || '#000000',
  '--ag-border-color': props.content?.borderColor || '#E0E0E0',
  '--ag-row-border-color': props.content?.borderColor || '#E0E0E0',
  width: '100%',
  height: '100%',
  'min-height': '400px'
  }));
  
  // Load AG Grid resources with proper error handling
  async function loadAgGridResources() {
    try {
      // Use a unique identifier for this component instance
      const instanceId = `ag-grid-${props.uid}`;
      if (!window[instanceId]) {
        window[instanceId] = true;

        // Create container for AG Grid resources if it doesn't exist
        const resourceContainer = document.getElementById('ww-ag-grid-resources') || (() => {
          const container = document.createElement('div');
          container.id = 'ww-ag-grid-resources';
          document.body.appendChild(container);
          return container;
        })();

        // Load AG Grid script if not already loaded
        if (!window.agGrid) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.3/dist/ag-grid-community.min.noStyle.js';
            script.onload = resolve;
            script.onerror = reject;
            resourceContainer.appendChild(script);
          });
        }

        // Load CSS files if not already loaded
        const cssFiles = [
          'https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.3/styles/ag-grid.css',
          `https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.3/styles/ag-theme-${props.content?.theme || 'quartz'}.css`
        ];

        for (const href of cssFiles) {
          if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            resourceContainer.appendChild(link);
          }
        }

        setGridState({ ...gridState.value, scriptLoaded: true, cssLoaded: true });
      }
    } catch (error) {
  console.error('Failed to load AG Grid resources:', error);
  emit('trigger-event', {
  name: 'error',
  event: { message: 'Failed to load AG Grid resources', type: 'error' }
  });
  }
  }
  
  // Initialize grid with proper error handling
  async function initializeAgGrid() {
    if (!window.agGrid || !agGridElement.value) {
      console.warn('AG Grid or element not ready, waiting...');
      return;
    }
  
  try {
  const gridOptions = {
  columnDefs: props.content?.columnDefs || [],
  defaultColDef: {
  editable: true,
  sortable: props.content?.enableSorting ?? true,
  filter: props.content?.enableFiltering ?? true,
  resizable: true,
  minWidth: 150
  },
  rowData: props.content?.tableData || [],
  pagination: true,
  paginationPageSize: props.content?.pageSize || 25,
  rowSelection: 'multiple',
  domLayout: 'normal',
  rowHeight: props.content?.rowHeight || 25,
  onGridReady: (params) => {
  gridApi = params.api;
  gridColumnApi = params.columnApi;
  if (props.content?.autoSizeColumns) {
  params.api.sizeColumnsToFit();
  }
  },
  onCellValueChanged: handleCellValueChanged
  };
  
  new window.agGrid.Grid(agGridElement.value, gridOptions);
  } catch (error) {
  console.error('Failed to initialize grid:', error);
  emit('trigger-event', {
  name: 'error',
  event: { message: 'Failed to initialize grid', type: 'error' }
  });
  }
  }
  
  // Handle cell value changes
  const handleCellValueChanged = async (event) => {
  if (!props.content?.xanoEndpoint || isUpdating) return;
  
  const updatedData = { ...event.data };
  const originalValue = event.oldValue;
  isUpdating = true;
  
  try {
  setGridState({ ...gridState.value, isLoading: true });
  const response = await fetch(props.content.xanoEndpoint, {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  ...(props.content.xanoHeaders || {})
  },
  body: JSON.stringify(updatedData)
  });
  
  if (!response.ok) throw new Error('Update failed');
  
  const result = await response.json();
  emit('trigger-event', {
  name: 'cellValueChanged',
  event: { field: event.column.colId, oldValue: originalValue, newValue: event.newValue, rowData: result }
  });
  } catch (error) {
  event.node.setDataValue(event.column.colId, originalValue);
  emit('trigger-event', {
  name: 'error',
  event: { message: error.message, type: 'error' }
  });
  } finally {
  isUpdating = false;
  setGridState({ ...gridState.value, isLoading: false });
  }
  };
  
  // Watch for data changes with immediate effect
  watch(() => props.content?.tableData, (newData) => {
    if (gridApi && !isUpdating) {
      console.log('Updating grid data:', newData);
      gridApi.setRowData(newData || []);
    }
  }, { deep: true, immediate: true });

  // Watch for column definition changes
  watch(() => props.content?.columnDefs, (newDefs) => {
    if (gridApi && !isUpdating) {
      console.log('Updating column definitions:', newDefs);
      gridApi.setColumnDefs(newDefs || []);
    }
  }, { deep: true, immediate: true });
  
  // Component lifecycle
  onMounted(async () => {
    try {
      await loadAgGridResources();
      await initializeAgGrid();
      
      // Ensure data is set after grid is initialized
      if (gridApi && props.content?.tableData) {
        console.log('Setting initial data:', props.content.tableData);
        gridApi.setRowData(props.content.tableData);
      }
    } catch (error) {
      console.error('Failed to initialize grid:', error);
      emit('trigger-event', {
        name: 'error',
        event: { message: 'Failed to initialize grid', type: 'error' }
      });
    }
  });
  
  onBeforeUnmount(() => {
    if (gridApi) {
      gridApi.destroy();
      gridApi = null;
    }

    // Clean up instance flag
    const instanceId = `ag-grid-${props.uid}`;
    if (window[instanceId]) {
      delete window[instanceId];
    }

    // Only remove resources if this is the last AG Grid instance
    const hasOtherInstances = Object.keys(window).some(key => key.startsWith('ag-grid-') && key !== instanceId);
    if (!hasOtherInstances) {
      const resourceContainer = document.getElementById('ww-ag-grid-resources');
      if (resourceContainer) {
        resourceContainer.remove();
      }
    }
  });
  
  return {
  agGridElement,
  gridState,
  gridThemeClass,
  gridCustomStyles
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
  
  .ag-grid-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
  
  &.is-loading {
  pointer-events: none;
  opacity: 0.7;
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
  }
  </style>
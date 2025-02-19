<template>
  <div class="ag-grid-wrapper" :style="{ 
    fontFamily: content?.fontFamily || 'Arial, sans-serif',
    height: '500px'
  }">
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
  
  // Transform column definitions with proper data handling
  function transformColumnDefs(columnDefs) {
    return columnDefs.map(col => {
      const column = { ...col };

      // Add checkbox column if specified
      if (column.field === '_checkbox' || column.checkboxSelection) {
        column.headerName = '';
        column.width = column.width || 50;
        column.editable = false;
        column.sortable = false;
        column.filter = false;
        column.checkboxSelection = true;
        column.headerCheckboxSelection = true;
        column.pinned = 'left';
      }

      // Style numerical IDs
      if (column.field === 'id' || column.isId) {
        column.cellStyle = {
          fontFamily: 'monospace',
          color: '#666'
        };
      }

      // Style clickable fields
      if (column.isClickable) {
        column.cellRenderer = params => {
          const container = document.createElement('div');
          container.style.whiteSpace = 'normal';
          container.style.lineHeight = '1.5';
          container.style.cursor = 'pointer';
          
          const text = params.value || '';
          container.innerHTML = `<span style="color: #1a73e8; text-decoration: none; font-weight: 500;">${text}</span>`;
          
          container.addEventListener('mouseover', () => {
            container.firstChild.style.textDecoration = 'underline';
          });
          container.addEventListener('mouseout', () => {
            container.firstChild.style.textDecoration = 'none';
          });
          
          return container;
        };
      }

      // Handle timestamp data type
      if (column.dataType === 'timestamp') {
        column.valueFormatter = params => {
          if (!params.value) return '';
          return new Date(params.value).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        };
        if (column.highlightPastDue) {
          column.cellStyle = params => {
            const now = new Date();
            const date = new Date(params.value);
            return {
              color: date < now ? '#D93025' : 'inherit',
              fontWeight: date < now ? '500' : 'normal'
            };
          };
        }
      }

      // Handle boolean data type
      if (column.dataType === 'boolean') {
        column.cellRenderer = params => {
          const checked = params.value ? 'checked' : '';
          return `<div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
          ">
            <input 
              type="checkbox" 
              ${checked}
              style="
                width: 18px;
                height: 18px;
                border: 2px solid #1a73e8;
                border-radius: 2px;
                cursor: pointer;
              "
              onclick="return false;"
            />
          </div>`;
        };
      }

      // Handle dropdown data type
      if (column.dataType === 'dropdown') {
        column.cellEditor = 'agSelectCellEditor';
        column.cellEditorParams = {
          values: column.dropdownOptions || []
        };
        
        // Add status styling if it's a status field
        if (column.field === 'status' || column.isStatus) {
          column.cellRenderer = params => {
            const styles = {
              'Delivered': { bg: '#E6F4EA', color: '#1E8E3E', text: 'delivered' },
              'Shipped': { bg: '#E8F0FE', color: '#1967D2', text: 'shipped' },
              'Pending': { bg: '#FEF7E0', color: '#E37400', text: 'pending' },
              'Cancelled': { bg: '#FCE8E6', color: '#D93025', text: 'Cancelled' }
            };
            const style = styles[params.value] || styles.Pending;
            return `<div style="
              background: ${style.bg};
              color: ${style.color};
              border-radius: 16px;
              padding: 4px 12px;
              font-size: 13px;
              font-weight: 500;
              display: inline-block;
              text-transform: lowercase;
              line-height: 16px;
              letter-spacing: 0.2px;
            ">${style.text}</div>`;
          };
        }
      }

      // Handle currency formatting
      if (column.isCurrency) {
        column.valueFormatter = params => {
          if (!params.value) return '';
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
          }).format(params.value);
        };
        column.cellStyle = {
          fontFamily: 'monospace',
          fontWeight: '500'
        };
      }

      // Handle rich text data type
      if (column.dataType === 'richtext') {
        column.cellRenderer = params => {
          const container = document.createElement('div');
          container.style.whiteSpace = 'normal';
          container.style.wordBreak = 'break-word';
          container.style.cursor = 'pointer';

          const originalHtml = params.value || '';
          const trimmedHtml = originalHtml.trim();

          if (trimmedHtml === '' || trimmedHtml === '<p></p>') {
            container.innerHTML = '<i class="ph ph-plus-square" style="font-size: 24px;"></i>';
          } else {
            let truncatedHtml = truncateHtml(originalHtml, 300);
            if (typeof DOMPurify !== 'undefined') {
              truncatedHtml = DOMPurify.sanitize(truncatedHtml);
            }
            container.innerHTML = truncatedHtml;
          }

          if (column.onClick) {
            container.addEventListener('click', () => {
              if (typeof wwLib !== 'undefined') {
                wwLib.executeWorkflow(column.onClick.workflowId, {
                  row: params.data,
                  type: column.onClick.type || 'click'
                });
              }
            });
          }

          return container;
        };
      }

      return column;
    });
  }

  // Helper function to truncate HTML safely
  function truncateHtml(html, maxLength) {
    const div = document.createElement('div');
    div.innerHTML = html;
    let text = div.textContent || div.innerText || '';
    if (text.length <= maxLength) return html;
    text = text.substr(0, maxLength) + '...';
    return text;
  }

  // Initialize grid with proper error handling
  async function initializeAgGrid() {
    console.log('Initializing AG Grid with content:', props.content);
    if (!window.agGrid || !agGridElement.value) {
      console.warn('AG Grid or element not ready, waiting...');
      return;
    }
  
  try {
    console.log('Initializing grid with mode:', props.content?.advancedMode ? 'advanced' : 'basic');

    // Parse custom code in advanced mode
    let customGridOptions = {};
    let customColumnDefs = [];
    let customEvents = {};

    if (props.content?.advancedMode) {
      try {
        // Parse grid options
        if (props.content?.gridOptions) {
          try {
            customGridOptions = JSON.parse(props.content.gridOptions);
          } catch (e) {
            console.warn('Invalid grid options format:', e);
          }
        }
        // Parse column definitions
        if (props.content?.columnDefsCode) {
          try {
            customColumnDefs = JSON.parse(props.content.columnDefsCode);
          } catch (e) {
            console.warn('Invalid column definitions format:', e);
          }
        }
        // Parse custom events
        if (props.content?.customEvents) {
          try {
            customEvents = JSON.parse(props.content.customEvents);
          } catch (e) {
            console.warn('Invalid events format:', e);
          }
        }
      } catch (parseError) {
        console.error('Error parsing custom code:', parseError);
        emit('trigger-event', {
          name: 'error',
          event: { message: 'Invalid custom code: ' + parseError.message, type: 'error' }
        });
      }
    }

    // Get row class rules from column definitions
  const getRowClassRules = () => {
    const rules = {};
    props.content?.columnDefs?.forEach(col => {
      if (col.rowClassRules) {
        Object.assign(rules, col.rowClassRules);
      }
    });
    return rules;
  };

  const gridOptions = props.content?.advancedMode ? {
      // Base options
      rowData: ensureValidData(props.content?.tableData),
      columnDefs: customColumnDefs,
      // Merge custom options
      ...customGridOptions,
      // Merge custom events
      ...customEvents,
      // Ensure required callbacks are preserved
      onGridReady: (params) => {
        gridApi = params.api;
        gridColumnApi = params.columnApi;
        if (props.content?.autoSizeColumns) {
          params.api.sizeColumnsToFit();
        }
        // Call custom onGridReady if provided
        if (customEvents.onGridReady) {
          customEvents.onGridReady(params);
        }
      }
    } : {
  columnDefs: transformColumnDefs(props.content?.columnDefs || []),
  defaultColDef: {
    editable: true,
    sortable: props.content?.enableSorting ?? true,
    filter: props.content?.enableFiltering ?? true,
    resizable: true,
    minWidth: 150,
    checkboxSelection: col => col.field === (props.content?.checkboxSelectionField || '_checkbox'),
    headerCheckboxSelection: col => col.field === (props.content?.checkboxSelectionField || '_checkbox')
  },
  rowSelection: 'multiple',
  rowMultiSelectWithClick: true,
  rowClassRules: getRowClassRules(),
  rowHeight: props.content?.rowHeight || 40,
  headerHeight: props.content?.headerHeight || 40,
  pagination: true,
  paginationPageSize: props.content?.pageSize || 10,
  suppressPaginationPanel: false,
  rowData: ensureValidData(props.content?.tableData),
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
  
  // Ensure data is always in the correct format
  const ensureValidData = (data) => {
    if (!data) return [];
    if (typeof data === 'object' && !Array.isArray(data)) {
      console.warn('Data is an object but not an array, attempting to convert...');
      // If it's an object with numeric keys, convert to array
      const values = Object.values(data);
      if (values.length > 0) return values;
      return [];
    }
    return Array.isArray(data) ? data : [];
  };

  // Watch for data changes with immediate effect
  watch(() => props.content?.tableData, (newData) => {
    if (gridApi && !isUpdating) {
      console.log('Updating grid data:', newData);
      const validData = ensureValidData(newData);
      console.log('Processed data:', validData);
      gridApi.setRowData(validData);
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
      if (gridApi) {
        console.log('Setting initial data:', props.content?.tableData);
        const validData = ensureValidData(props.content?.tableData);
        console.log('Processed initial data:', validData);
        gridApi.setRowData(validData);
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
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
    height: 500px;
  
  .ag-grid-container {
    width: 100%;
    flex: 1;
    position: relative;
    overflow: auto;
    min-height: 0;
  
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

  :deep(.ag-checkbox-input-wrapper) {
    width: 16px;
    height: 16px;
    border: 2px solid #ddd;
    border-radius: 3px;
    &.ag-checked {
      background-color: #1a73e8;
      border-color: #1a73e8;
      &::after {
        color: white;
      }
    }
  }

  :deep(.ag-paging-panel) {
    height: 40px;
    padding: 0 12px;
    font-size: 13px;
    color: #666;
    .ag-paging-row-summary-panel {
      margin: 0 12px;
    }
    .ag-paging-button {
      cursor: pointer;
      opacity: 0.5;
      &:hover:not(.ag-disabled) {
        opacity: 1;
      }
    }
  }

  :deep(.ag-row) {
    transition: background-color 0.2s;
    &:hover {
      background-color: #f5f5f5;
    }
  }
  }
  </style>
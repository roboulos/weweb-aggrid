<template>
  <div class="ag-grid-wrapper" :style="{ 
    fontFamily: content?.fontFamily || 'Arial, sans-serif',
    height: '500px'
  }">
    <!-- Version Display -->
    <div class="version-display" v-if="content?.showVersion !== false">v1.3.1</div>
    
    <!-- Grid Controls -->
    <div class="grid-controls" v-if="content?.enableQuickFilter || content?.enablePresetFilters">
      <!-- Quick Filter -->
      <div class="quick-filter-container" v-if="content?.enableQuickFilter">
        <input 
          type="text" 
          class="quick-filter-input"
          v-model="quickFilterText"
          :placeholder="content?.quickFilterPlaceholder || 'Search...'"
          @input="e => { console.log('Quick filter input:', e.target.value); }"
        />
        <button 
          v-if="quickFilterText" 
          class="clear-filter-button"
          @click="clearQuickFilter"
        >
          ×
        </button>
      </div>
      
      <!-- Preset Filters -->
      <div class="preset-filters-container" v-if="content?.enablePresetFilters && content?.presetFilters?.length">
        <button 
          v-for="(filter, index) in content.presetFilters" 
          :key="index"
          class="preset-filter-button"
          :class="{ 'active': activePresetFilter === index }"
          :style="{ backgroundColor: filter.color || '#1a73e8', borderColor: filter.color || '#1a73e8' }"
          @click="applyPresetFilter(filter, index)"
        >
          {{ filter.label }}
        </button>
        <button 
          v-if="activePresetFilter !== null" 
          class="clear-filters-button"
          @click="clearPresetFilters"
        >
          Clear Filters
        </button>
      </div>
    </div>
    
    <!-- Main Grid -->
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
    
    <!-- Add Row Button -->
    <div v-if="content?.showAddRowButton" class="add-row-button">
      <button @click="addNewRow">+ Add Row</button>
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
  
  // State for quick filter and preset filters
  const quickFilterText = ref('');
  const activePresetFilter = ref(null);
  
  // Quick filter methods
  function clearQuickFilter() {
    quickFilterText.value = '';
    if (gridApi) {
      gridApi.setQuickFilter('');
      
      // Emit filter cleared event
      emit('trigger-event', {
        name: 'quickFilterCleared',
        event: {}
      });
    }
  }
  
  // Preset filter methods
  function applyPresetFilter(filter, index) {
    console.log('Applying preset filter:', filter, 'at index:', index);
    if (!gridApi) {
      console.warn('Grid API not available for preset filter');
      return;
    }
    
    // If clicking the active filter, clear it
    if (activePresetFilter.value === index) {
      clearPresetFilters();
      return;
    }
    
    // Clear any existing filters
    gridApi.setFilterModel(null);
    
    // Apply the new filter
    const filterInstance = gridApi.getFilterInstance(filter.field);
    console.log('Filter instance for field', filter.field, ':', filterInstance);
    
    if (filterInstance) {
      const filterModel = {
        type: filter.operator || 'equals',
        filter: filter.value
      };
      console.log('Setting filter model:', filterModel);
      filterInstance.setModel(filterModel);
      gridApi.onFilterChanged();
      activePresetFilter.value = index;
      
      // Emit filter applied event
      emit('trigger-event', {
        name: 'presetFilterApplied',
        event: { filter: filter.label, field: filter.field, value: filter.value }
      });
    } else {
      console.warn('Could not find filter instance for field:', filter.field);
      // Try applying filter directly through API as fallback
      const filterModel = {};
      filterModel[filter.field] = {
        type: filter.operator || 'equals',
        filter: filter.value
      };
      console.log('Applying filter model directly:', filterModel);
      gridApi.setFilterModel(filterModel);
      gridApi.onFilterChanged();
      activePresetFilter.value = index;
      
      emit('trigger-event', {
        name: 'presetFilterApplied',
        event: { filter: filter.label, field: filter.field, value: filter.value }
      });
    }
  }
  
  function clearPresetFilters() {
    if (gridApi) {
      gridApi.setFilterModel(null);
      activePresetFilter.value = null;
      
      // Emit filter cleared event
      emit('trigger-event', {
        name: 'presetFilterCleared',
        event: {}
      });
    }
  }
  
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

        // Add event listener to prevent clicks from bubbling outside the grid
        // This is crucial for editing in deployed environments
        document.addEventListener('click', preventClickPropagation, true);
        
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
  
  // Prevent click events from bubbling outside the grid when editing
  // This is critical for deployed environments where WeWeb might capture clicks
  function preventClickPropagation(event) {
    const agGridElement = document.querySelector('.ag-grid-container');
    
    // Only apply to editing cells, not headers or other grid elements
    if (agGridElement && agGridElement.contains(event.target)) {
      // Check if we're clicking directly on an editing cell or within it
      const isEditingCell = event.target.classList.contains('ag-cell-inline-editing') || 
                          event.target.closest('.ag-cell-inline-editing');
      
      // Check if we're clicking on an input or select element within a cell
      const isEditingInput = event.target.tagName === 'INPUT' || 
                           event.target.tagName === 'SELECT' || 
                           event.target.tagName === 'TEXTAREA';
      
      // Don't interfere with header clicks (for sorting/filtering)
      const isHeaderClick = event.target.classList.contains('ag-header-cell') || 
                          event.target.closest('.ag-header-cell') || 
                          event.target.classList.contains('ag-header-cell-text');
      
      // Only stop propagation if we're editing a cell and not clicking on headers
      if ((isEditingCell || isEditingInput) && !isHeaderClick) {
        event.stopPropagation();
      }
    }
  }
  
  // Transform column definitions with proper data handling
  function transformColumnDefs(columnDefs) {
    return columnDefs.map(col => {
      const column = { ...col };

      // Handle text wrapping
      if (column.wrapText) {
        column.cellStyle = {
          ...(column.cellStyle || {}),
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          lineHeight: '1.2'
        };
      } else {
        column.cellStyle = {
          ...(column.cellStyle || {}),
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        };
      }

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

      // Handle date-only data type
      if (column.dataType === 'date') {
        column.valueFormatter = params => {
          if (!params.value) return '';
          // Format only date portion without time
          return new Date(params.value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        };
        // Configure date editor
        column.cellEditor = 'agDateCellEditor';
        column.cellEditorParams = {
          // Format that only includes date, not time
          jsDateFormat: 'MM/dd/yyyy'
        };
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
          container.style.lineHeight = '1.4';
          container.style.maxHeight = `${props.content?.rowHeight * 0.8}px`;
          container.style.overflow = 'hidden';
          container.style.cursor = 'pointer';

          const originalHtml = params.value || '';
          const trimmedHtml = originalHtml.trim();

          if (trimmedHtml === '' || trimmedHtml === '<p></p>') {
            container.innerHTML = '<span style="color: #999; font-style: italic;">Click to edit</span>';
          } else {
            // More careful HTML sanitization
            let sanitizedHtml = trimmedHtml;
            if (typeof DOMPurify !== 'undefined') {
              sanitizedHtml = DOMPurify.sanitize(sanitizedHtml);
            } else {
              // Basic sanitization fallback
              sanitizedHtml = sanitizedHtml
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/on\w+="[^"]*"/g, '');
            }
            container.innerHTML = sanitizedHtml;
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
    
    // Reset filter state
    quickFilterText.value = '';
    activePresetFilter.value = null;
  
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
  
  // Create detail cell renderer for master-detail view
  const createDetailCellRenderer = () => {
    if (!props.content?.enableMasterDetail) return null;
    
    return (params) => {
      const template = props.content?.detailCellRenderer || '<div class="detail-cell">Detail view</div>';
      // Replace {{data.fieldName}} with actual data
      const renderedTemplate = template.replace(/\{\{data\.(\w+)\}\}/g, (match, field) => {
        return params.data[field] !== undefined ? params.data[field] : '';
      });
      
      const div = document.createElement('div');
      div.innerHTML = renderedTemplate;
      return div;
    };
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
      },
      onRowSelected: (event) => {
        if (event.node.isSelected()) {
          emit('trigger-event', {
            name: 'rowSelected',
            event: { rowData: event.data }
          });
        } else {
          emit('trigger-event', {
            name: 'rowDeselected',
            event: { rowData: event.data }
          });
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
    headerCheckboxSelection: col => col.field === (props.content?.checkboxSelectionField || '_checkbox'),
    // Improve editing behavior
    cellClassRules: {
      'ag-cell-editing': params => params.node.editing,
    },
    // Ensure editors stay focused
    stopEditingWhenCellsLoseFocus: false
  },
  rowSelection: props.content?.rowSelectionMode || 'multiple',
  rowMultiSelectWithClick: true,
  rowClassRules: getRowClassRules(),
  rowHeight: props.content?.rowHeight || 40,
  headerHeight: props.content?.headerHeight || 40,
  pagination: true,
  paginationPageSize: props.content?.pageSize || 10,
  suppressPaginationPanel: false,
  rowData: ensureValidData(props.content?.tableData),
  
  // Tree data configuration
  treeData: props.content?.enableTreeData || false,
  autoGroupColumnDef: props.content?.enableTreeData ? {
    headerName: 'Group',
    minWidth: 200,
    cellRendererParams: {
      suppressCount: false,
    },
  } : undefined,
  getDataPath: props.content?.enableTreeData ? (data) => {
    // Use a path based on the configured child field
    const childField = props.content?.treeDataChildField || 'children';
    return data[childField] ? data[childField].split('/') : [];
  } : undefined,
  
  // Master-detail configuration
  masterDetail: props.content?.enableMasterDetail || false,
  detailCellRenderer: props.content?.enableMasterDetail ? createDetailCellRenderer() : undefined,
  detailRowHeight: 200,
  // Prevent duplicate pagination options
  // pagination: true, (removed duplicate)
  // paginationPageSize: props.content?.pageSize || 25, (removed duplicate)
  // Prevent duplicate rowSelection
  // rowSelection: 'multiple', (removed duplicate)
  domLayout: 'normal',
  rowHeight: props.content?.rowHeight || 25,
  // Critical for deployed environments - prevent editing from being cancelled
  suppressClickEdit: false,
  suppressCellFocus: false,
  enableCellTextSelection: true,
  ensureDomOrder: true,
  // Prevent outside clicks from cancelling edit
  stopEditingWhenGridLosesFocus: false,
  onGridReady: (params) => {
    gridApi = params.api;
    gridColumnApi = params.columnApi;
    
    // Apply any existing quick filter
    if (quickFilterText.value) {
      gridApi.setQuickFilter(quickFilterText.value);
    }
    
    // Auto-size columns if enabled
    if (props.content?.autoSizeColumns) {
      params.api.sizeColumnsToFit();
    }
    
    // Emit grid ready event
    emit('trigger-event', {
      name: 'gridReady',
      event: { }
    });
  },
  onCellValueChanged: handleCellValueChanged,
  onRowSelected: (event) => {
    if (event.node.isSelected()) {
      emit('trigger-event', {
        name: 'rowSelected',
        event: { rowData: event.data }
      });
    } else {
      emit('trigger-event', {
        name: 'rowDeselected',
        event: { rowData: event.data }
      });
    }
  }
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
  });
  
  // Watch for changes to quick filter text
  watch(quickFilterText, (newValue) => {
    if (gridApi) {
      console.log('Setting quick filter:', newValue);
      gridApi.setQuickFilter(newValue);
      
      // Emit filter applied event
      emit('trigger-event', {
        name: 'quickFilterApplied',
        event: { filterText: newValue }
      });
    } else {
      console.warn('Grid API not available for quick filter');
    }
  });
  
  // Add new row functionality
  const addNewRow = async () => {
    if (!gridApi) return;

    // Create empty row based on existing columns
    const emptyRow = {};
    const columnDefs = props.content?.columnDefs || [];
    columnDefs.forEach(col => {
      if (col.field && col.field !== '_checkbox') {
        emptyRow[col.field] = null;
      }
    });

    // If XANO create endpoint is configured, use it
    if (props.content?.xanoCreateEndpoint) {
      try {
        setGridState({ ...gridState.value, isLoading: true });
        
        // Call XANO endpoint to create new record
        const response = await fetch(props.content.xanoCreateEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(props.content.xanoHeaders || {})
          },
          body: JSON.stringify(emptyRow)
        });

        if (!response.ok) throw new Error('Failed to create new record');
        
        // Get the newly created record from the response
        const newRecord = await response.json();
        
        // Emit event with the new record data
        emit('trigger-event', {
          name: 'recordCreated',
          event: { newRecord }
        });
        
        // Refresh the grid data if needed
        if (typeof props.content?.refreshData === 'function') {
          props.content.refreshData();
        }
      } catch (error) {
        console.error('Failed to create new record:', error);
        emit('trigger-event', {
          name: 'error',
          event: { message: error.message, type: 'error' }
        });
      } finally {
        setGridState({ ...gridState.value, isLoading: false });
      }
    } else {
      // Fallback to local row addition if no endpoint is configured
      const rowData = [...(ensureValidData(props.content?.tableData) || []), emptyRow];
      gridApi.setRowData(rowData);
      
      // Scroll to the new row
      setTimeout(() => {
        gridApi.ensureIndexVisible(rowData.length - 1);
        gridApi.setFocusedCell(rowData.length - 1, columnDefs[0]?.field || '');
      }, 100);

      // Emit event so the parent component can update data source
      emit('trigger-event', {
        name: 'rowAdded',
        event: { newRow: emptyRow }
      });
    }
  };

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
        
        // Apply any initial quick filter
        if (quickFilterText.value) {
          console.log('Applying initial quick filter:', quickFilterText.value);
          gridApi.setQuickFilter(quickFilterText.value);
        }
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
    // Remove the click event listener we added for editing
    document.removeEventListener('click', preventClickPropagation, true);
    
    if (gridApi) {
      // Ensure any active editing is completed before destroying
      try {
        gridApi.stopEditing();
      } catch (e) {
        console.warn('Error stopping editing:', e);
      }
      
      gridApi.destroy();
      gridApi = null;
      gridColumnApi = null;
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
    gridCustomStyles,
    addNewRow,
    addNewRecord: addNewRow
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
    
  .version-display {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #f5f5f5;
    color: #666;
    font-size: 10px;
    padding: 2px 5px;
    border-radius: 0 0 0 4px;
    opacity: 0.7;
    z-index: 10;
  }
  
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
  
  // Grid controls for filters
  .grid-controls {
    padding: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    border-bottom: 1px solid #ddd;
    background: #f5f5f5;
    
    .quick-filter-container {
      position: relative;
      flex: 1;
      min-width: 200px;
      
      .quick-filter-input {
        width: 100%;
        padding: 8px 30px 8px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        
        &:focus {
          outline: none;
          border-color: #1a73e8;
          box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
        }
      }
      
      .clear-filter-button {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #666;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        
        &:hover {
          color: #333;
        }
      }
    }
    
    .preset-filters-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .preset-filter-button {
        padding: 6px 12px;
        border-radius: 4px;
        background-color: #1a73e8;
        color: white;
        border: 1px solid #1a73e8;
        cursor: pointer;
        font-size: 13px;
        transition: opacity 0.2s;
        
        &:hover {
          opacity: 0.9;
        }
        
        &.active {
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
        }
      }
      
      .clear-filters-button {
        padding: 6px 12px;
        border-radius: 4px;
        background-color: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
        cursor: pointer;
        font-size: 13px;
        
        &:hover {
          background-color: #e5e5e5;
        }
      }
    }
  }
  
  // Detail cell styling
  :deep(.detail-cell) {
    padding: 20px;
    background: #f9f9f9;
    border-radius: 4px;
    margin: 10px;
    
    h3 {
      margin-top: 0;
      color: #333;
      font-size: 16px;
    }
    
    p {
      margin-bottom: 0;
      color: #666;
      font-size: 14px;
    }
  }
  
  .add-row-button {
    padding: 12px;
    text-align: right;
    border-top: 1px solid #ddd;
    background: #f5f5f5;
    button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
      border-radius: 4px;
      &:hover {
        background: #1565c0;
      }
    }
  }
  }
  </style>
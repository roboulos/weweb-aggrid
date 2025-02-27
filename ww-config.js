// Example themeParams that produce a custom theme:
// {
//   "accentColor": "#0086F4",
//   "backgroundColor": "#F1EDE1",
//   "borderColor": "#98968F",
//   "borderRadius": 0,
//   "browserColorScheme": "light",
//   "chromeBackgroundColor": { "ref": "backgroundColor" },
//   "fontFamily": { "googleFont": "Pixelify Sans" },
//   "fontSize": 15,
//   "foregroundColor": "#605E57",
//   "headerBackgroundColor": "#E4DAD1",
//   "headerFontSize": 15,
//   "headerFontWeight": 700,
//   "headerTextColor": "#3C3A35",
//   "rowVerticalPaddingScale": 1.2,
//   "spacing": 5,
//   "wrapperBorderRadius": 0
// }

export default {
  name: "AG Grid Component",
  editor: {
    label: { en: 'AG Grid Xano' },
    icon: 'table'
  },
  properties: {
    /* wwEditor:start */
    // Advanced Configuration
    advancedMode: {
      label: { en: 'Advanced Mode' },
      type: 'OnOff',
      section: 'advanced',
      defaultValue: false,
      propertyHelp: { tooltip: 'Enable to use custom AG Grid configuration' }
    },
    // Advanced Grid Options
    gridOptions: {
      label: { en: 'Grid Options' },
      type: 'Text',
      section: 'advanced',
      defaultValue: '{"defaultColDef":{"sortable":true,"filter":true}}',
      options: {
        type: 'code',
        language: 'javascript'
      },
      hidden: content => !content.advancedMode,
      propertyHelp: { tooltip: 'Custom AG Grid options in JSON format' }
    },
    // Advanced Column Definitions
    columnDefsCode: {
      label: { en: 'Column Definitions Code' },
      type: 'Text',
      section: 'advanced',
      defaultValue: '[{"field":"name","headerName":"Name","width":150,"cellStyle":{"color":"#2196F3","fontWeight":"bold"}}]',
      options: {
        type: 'code',
        language: 'javascript'
      },
      hidden: content => !content.advancedMode,
      propertyHelp: { tooltip: 'Custom column definitions with full AG Grid features' }
    },
    // Advanced Event Handlers
    customEvents: {
      label: { en: 'Custom Events' },
      type: 'Text',
      section: 'advanced',
      defaultValue: '{"onCellClicked":true,"onRowSelected":true,"onFilterChanged":true}',
      options: {
        type: 'code',
        language: 'javascript'
      },
      hidden: content => !content.advancedMode,
      propertyHelp: { tooltip: 'Custom event handlers for the grid' }
    },
    // Grid Layout
    rowHeight: {
      label: { en: 'Row Height' },
      type: 'Number',
      section: 'layout',
      defaultValue: 40,
      options: { min: 25, max: 100 }
    },
    headerHeight: {
      label: { en: 'Header Height' },
      type: 'Number',
      section: 'layout',
      defaultValue: 40,
      options: { min: 25, max: 100 }
    },
    pageSize: {
      label: { en: 'Page Size' },
      type: 'Number',
      section: 'layout',
      defaultValue: 10,
      options: { min: 5, max: 100 }
    },
    checkboxSelectionField: {
      label: { en: 'Selection Column' },
      type: 'Text',
      section: 'layout',
      defaultValue: '_checkbox',
      propertyHelp: { tooltip: 'Field name for checkbox selection column' }
    },

    // Data properties
    tableData: {
      label: { en: 'Table Data' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      bindingValidation: {
        type: 'Array',
        tooltip: 'Bind to an array of objects to display in the grid'
      },
      propertyHelp: { tooltip: 'The data to display in the grid' }
    },
    columnDefs: {
      label: { en: 'Column Definitions' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      options: {
        expandable: true,
        getItemLabel(_, index) { return `Column ${index + 1}`; },
        item: {
          type: 'Object',
          defaultValue: {
            field: '',
            headerName: '',
            editable: true,
            width: 100,
            sortable: true,
            filter: true,
            dataType: 'text',
            dropdownOptions: [],
            wrapText: false
          },
          options: {
            item: {
              field: { label: 'Field', type: 'Text', options: { placeholder: 'Data field name' } },
              rowClassRules: {
                label: 'Row Style Rules',
                type: 'Object',
                options: {
                  item: {
                    className: { label: 'CSS Class', type: 'Text' },
                    condition: { label: 'Condition', type: 'Text', options: { placeholder: 'params.data.status === "active"' } }
                  }
                }
              },
              headerName: { label: 'Header', type: 'Text', options: { placeholder: 'Column header name' } },
              editable: { label: 'Editable', type: 'Boolean' },
              width: { label: 'Width', type: 'Number', options: { min: 50, max: 500 } },
              sortable: { label: 'Sortable', type: 'Boolean' },
              filter: { label: 'Filter', type: 'Boolean' },
              dataType: {
                label: 'Data Type',
                type: 'TextSelect',
                defaultValue: 'text',
                options: {
                  options: [
                    { value: 'text', label: 'Text' },
                    { value: 'timestamp', label: 'Timestamp' },
                    { value: 'date', label: 'Date Only' },
                    { value: 'boolean', label: 'Boolean' },
                    { value: 'dropdown', label: 'Dropdown' },
                    { value: 'richtext', label: 'Rich Text' }
                  ]
                }
              },
              onClick: {
                label: 'On Click Action',
                type: 'Object',
                defaultValue: {},
                options: {
                  item: {
                    workflowId: { 
                      label: 'Workflow ID', 
                      type: 'Text',
                      options: { placeholder: 'Enter workflow ID' }
                    },
                    type: { 
                      label: 'Action Type', 
                      type: 'Text',
                      defaultValue: 'click',
                      options: { placeholder: 'Action type (e.g., click, edit)' }
                    }
                  }
                },
                hidden: content => content.dataType !== 'richtext'
              },
              dropdownOptions: {
                label: 'Dropdown Options',
                type: 'Array',
                defaultValue: [],
                options: {
                  expandable: true,
                  getItemLabel(item, index) { return `Option ${index + 1}`; },
                  item: { type: 'Text' }
                }
              },
              wrapText: { 
                label: 'Wrap Text', 
                type: 'Boolean',
                defaultValue: false
              }
            }
          }
        }
      },
      bindingValidation: {
        type: 'Array',
        tooltip: 'Array of column definitions for the grid'
      },
      propertyHelp: { tooltip: 'Define the columns to display in the grid' }
    },
    xanoEndpoint: {
      label: { en: 'Xano Update Endpoint' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      bindingValidation: {
        type: 'string',
        tooltip: 'The Xano API endpoint URL for updating records'
      },
      propertyHelp: { tooltip: 'Enter the full URL of your Xano update endpoint' }
    },
    xanoCreateEndpoint: {
      label: { en: 'Xano Create Record Endpoint' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      bindingValidation: {
        type: 'string',
        tooltip: 'The Xano API endpoint URL for creating new records'
      },
      propertyHelp: { tooltip: 'Enter the full URL of your Xano endpoint for creating new records' }
    },
    xanoHeaders: {
      label: { en: 'Xano Headers' },
      type: 'Object',
      section: 'settings',
      bindable: true,
      defaultValue: {},
      bindingValidation: {
        type: 'object',
        tooltip: 'Custom headers to send with Xano requests'
      },
      propertyHelp: { tooltip: 'Additional headers for Xano API calls (e.g., authorization)' }
    },
    // Display settings
    fontFamily: {
      label: { en: 'Grid Font Family' },
      type: 'Text',
      section: 'style',
      bindable: true,
      defaultValue: 'Arial, sans-serif',
      bindingValidation: {
        type: 'string',
        tooltip: 'Set the font family for the grid'
      },
      propertyHelp: { tooltip: 'Customize the font used in the grid' }
    },
    rowHeight: {
      label: { en: 'Row Height' },
      type: 'Number',
      section: 'settings',
      bindable: true,
      defaultValue: 25,
      options: { min: 10, max: 200, step: 1 },
      bindingValidation: {
        type: 'number',
        tooltip: 'Row height in pixels'
      },
      propertyHelp: { tooltip: 'Set the height for each row in the grid' }
    },
    pageSize: {
      label: { en: 'Page Size' },
      type: 'Number',
      section: 'settings',
      bindable: true,
      defaultValue: 25,
      options: { min: 1, max: 1000, step: 1 },
      bindingValidation: {
        type: 'number',
        tooltip: 'Number of rows to display per page'
      },
      propertyHelp: { tooltip: 'Set how many rows to show on each page' }
    },
    enableFiltering: {
      label: { en: 'Enable Filtering' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: true,
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable or disable column filtering'
      },
      propertyHelp: { tooltip: 'Allow users to filter data in columns' }
    },
    enableSorting: {
      label: { en: 'Enable Sorting' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: true,
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable or disable column sorting'
      },
      propertyHelp: { tooltip: 'Allow users to sort data in columns' }
    },
    loadingMessage: {
      label: { en: 'Loading Message' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Updating...',
      bindingValidation: {
        type: 'string',
        tooltip: 'Message to display during updates'
      },
      propertyHelp: { tooltip: 'Customize the loading message shown during updates' }
    },
    // NEW: Auto Size Columns flag: if true, auto-size columns on grid ready.
    autoSizeColumns: {
      label: { en: 'Auto Size Columns' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: false
    },
    showAddRowButton: {
      label: { en: 'Show Add Row Button' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: false,
      propertyHelp: { tooltip: 'Show a button to add new blank rows to the grid' }
    },
    // Theme override properties (for CSS-based overrides)
    accentColor: {
      label: { en: 'Accent Color' },
      type: 'Color',
      section: 'theme',
      bindable: true,
      defaultValue: '#2196F3'
    },
    backgroundColor: {
      label: { en: 'Background Color' },
      type: 'Color',
      section: 'theme',
      bindable: true,
      defaultValue: '#FFFFFF'
    },
    headerBackgroundColor: {
      label: { en: 'Header Background Color' },
      type: 'Color',
      section: 'theme',
      bindable: true,
      defaultValue: '#F5F5F5'
    },
    headerTextColor: {
      label: { en: 'Header Text Color' },
      type: 'Color',
      section: 'theme',
      bindable: true,
      defaultValue: '#000000'
    },
    borderColor: {
      label: { en: 'Border Color' },
      type: 'Color',
      section: 'theme',
      bindable: true,
      defaultValue: '#E0E0E0'
    },
    // NEW: Selected row background color override.
    selectedRowBackgroundColor: {
      label: { en: 'Selected Row Background Color' },
      type: 'Color',
      section: 'theme',
      bindable: true,
      defaultValue: ''
    },
    // Legacy theme selector fallback
    theme: {
      label: { en: 'Grid Theme' },
      type: 'TextSelect',
      section: 'style',
      bindable: true,
      defaultValue: 'quartz',
      options: {
        options: [
          { value: 'quartz', label: 'Quartz' },
          { value: 'alpine', label: 'Alpine' },
          { value: 'balham', label: 'Balham' }
        ]
      },
      bindingValidation: {
        type: 'string',
        tooltip: 'The visual theme for the grid (for legacy CSS usage)'
      },
      propertyHelp: { tooltip: 'Select the visual style for the grid if not using custom theme parameters' }
    },
    // Allow full custom theme object from the user (if desired)
    customTheme: {
      label: { en: 'Custom Theme' },
      type: 'Object',
      section: 'style',
      bindable: true,
      defaultValue: null,
      bindingValidation: {
        type: 'object',
        tooltip: 'Pass a custom AG Grid theme object (generated via the Theme Builder/Theming API)'
      },
      propertyHelp: { tooltip: 'Import a theme object such as one generated from the AG Grid Theme Builder' }
    },
    // Allow overriding individual theme parameters.
    themeParams: {
      label: { en: 'Theme Parameters' },
      type: 'Object',
      section: 'style',
      bindable: true,
      defaultValue: {},
      bindingValidation: {
        type: 'object',
        tooltip: 'Theme parameter overrides for AG Grid (e.g., accentColor, headerTextColor)'
      },
      propertyHelp: { tooltip: 'Provide custom theme parameters to merge with the default theme' }
    }
  },
  triggerEvents: [
    {
      name: 'cellValueChanged',
      label: { en: 'On cell value changed' },
      event: { field: '', oldValue: null, newValue: null, rowData: {} }
    },
    {
      name: 'rowSelected',
      label: { en: 'On row selected' },
      event: { rowData: {} }
    },
    {
      name: 'rowDeselected',
      label: { en: 'On row deselected' },
      event: { rowData: {} }
    },
    {
      name: 'rowAdded',
      label: { en: 'On row added' },
      event: { newRow: {} }
    },
    {
      name: 'recordCreated',
      label: { en: 'On record created' },
      event: { newRecord: {} }
    },
    {
      name: 'error',
      label: { en: 'On error' },
      event: { message: '', type: '' }
    },
    {
      name: 'updateStart',
      label: { en: 'On update start' },
      event: { rowData: {} }
    },
    {
      name: 'updateComplete',
      label: { en: 'On update complete' },
      event: { success: true, data: {} }
    }
  ],
  actions: [
    {
      name: 'refreshData',
      label: { en: 'Refresh Data' },
      action: 'refreshData'
    },
    {
      name: 'exportToCSV',
      label: { en: 'Export to CSV' },
      action: 'exportToCSV'
    },
    {
      name: 'clearSelection',
      label: { en: 'Clear Selection' },
      action: 'clearSelection'
    },
    {
      name: 'retryUpdate',
      label: { en: 'Retry Update' },
      action: 'retryUpdate'
    },
    {
      name: 'addNewRecord',
      label: { en: 'Add New Record' },
      action: 'addNewRecord'
    }
  ]
};

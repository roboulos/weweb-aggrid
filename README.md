# AG Grid Component for WeWeb

A powerful and flexible AG Grid component that provides extensive data grid capabilities with easy configuration.

#### AG Grid Component

Properties:
- `tableData`: `Array` - Array of objects to display in the grid. Default: `[]`
- `columnDefs`: `Array` - Column definitions for the grid. Default: `[]`
- `xanoEndpoint`: `string` - Xano API endpoint for updates. Default: `''`
- `xanoHeaders`: `Object` - Custom headers for Xano requests. Default: `{}`
- `fontFamily`: `string` - Grid font family. Default: `'Arial, sans-serif'`
- `rowHeight`: `number` - Height of grid rows. Default: `25`
- `pageSize`: `number` - Rows per page. Default: `25`
- `enableFiltering`: `boolean` - Enable column filtering. Default: `true`
- `enableSorting`: `boolean` - Enable column sorting. Default: `true`
- `loadingMessage`: `string` - Loading overlay message. Default: `'Updating...'`
- `theme`: `'quartz' | 'alpine' | 'balham'` - Grid theme. Default: `'quartz'`

Events:
- `cellValueChanged`: {field: string, oldValue: any, newValue: any, rowData: Object} - Triggered when cell value changes
- `error`: {message: string, type: string} - Triggered on errors
- `updateStart`: {rowData: Object} - Triggered when update starts
- `updateComplete`: {success: boolean, data: Object} - Triggered when update completes

Actions:
- `refreshData`: Refreshes the grid data
- `exportToCSV`: Exports grid data to CSV
- `clearSelection`: Clears row selection
- `retryUpdate`: Retries last failed update

Variables:
- `gridState`: Object - Contains grid loading and error states

## Column Definition Examples

### Basic Text Column
```javascript
{
  "field": "id",
  "headerName": "ID",
  "editable": false,
  "width": 100,
  "sortable": true,
  "filter": true,
  "dataType": "text",
  "cellStyle": {
    "fontFamily": "monospace",
    "color": "#666"
  }
}
```

### Timestamp Column
```javascript
{
  "field": "created_at",
  "headerName": "Created At",
  "editable": false,
  "width": 150,
  "sortable": true,
  "filter": true,
  "dataType": "timestamp"
}
```

### Clickable Link Column
```javascript
{
  "field": "product_name",
  "headerName": "Product Name",
  "width": 250,
  "dataType": "text",
  "cellStyle": {
    "color": "#1a73e8",
    "cursor": "pointer"
  }
}
```

### Status Dropdown with Colors
```javascript
{
  "field": "status",
  "headerName": "Status",
  "width": 120,
  "dataType": "dropdown",
  "dropdownOptions": ["Pending", "Shipped", "Delivered", "Cancelled"],
  "cellStyle": params => ({
    "color":
      params.value === 'Delivered' ? '#32CD32' :
      params.value === 'Shipped' ? '#1a73e8' :
      params.value === 'Cancelled' ? '#ff4444' :
      '#ffa500',
    "fontWeight": "bold"
  })
}
```

### Dynamic Date Coloring
```javascript
{
  "field": "expected_delivery",
  "headerName": "Expected Delivery",
  "width": 150,
  "dataType": "timestamp",
  "cellStyle": params => {
    const now = new Date();
    const deliveryDate = new Date(params.value);
    return {
      "color": deliveryDate < now ? '#ff4444' : '#32CD32'
    };
  }
}
```

### Currency Column
```javascript
{
  "field": "price",
  "headerName": "Price",
  "width": 120,
  "dataType": "text",
  "valueFormatter": params => {
    if (!params.value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(params.value);
  },
  "cellStyle": params => ({
    "color": parseFloat(params.value) > 1000 ? '#ff4444' : '#32CD32'
  })
}
```

## Column Definition Features

### Basic Column Properties
```javascript
{
  field: "fieldName",          // Data field to display
  headerName: "Display Name",  // Column header text
  width: 150,                  // Column width in pixels
  editable: true,              // Allow cell editing
  sortable: true,              // Enable column sorting
  filter: true                 // Enable column filtering
}
```

### Data Types
The component supports various data types with built-in formatting and behavior:

1. **Text (Default)**
```javascript
{
  field: "name",
  headerName: "Name",
  dataType: "text"  // Default text display
}
```

2. **Timestamp**
```javascript
{
  field: "created_at",
  headerName: "Created At",
  dataType: "timestamp"  // Automatically formats to "Jan 17, 2025, 10:30 PM"
}
```

3. **Boolean**
```javascript
{
  field: "active",
  headerName: "Active",
  dataType: "boolean"  // Displays as a checkbox
}
```

4. **Dropdown**
```javascript
{
  field: "status",
  headerName: "Status",
  dataType: "dropdown",
  dropdownOptions: ["Pending", "Shipped", "Delivered", "Cancelled"]
}
```

5. **Rich Text**
```javascript
{
  field: "description",
  headerName: "Description",
  dataType: "richtext",
  onClick: {                    // Optional click handler
    workflowId: "workflow-id",  // WeWeb workflow to execute
    type: "description"         // Action type passed to workflow
  }
}
```

### Rich Text Features
- Automatic HTML sanitization
- Text truncation with ellipsis
- Click-to-expand functionality
- Workflow integration
- Empty state handling with icon

## Grid Configuration

### Basic Settings
```javascript
{
  fontFamily: "Arial, sans-serif",  // Grid font family
  rowHeight: 25,                    // Height of grid rows
  pageSize: 25,                     // Rows per page
  enableFiltering: true,            // Enable column filtering
  enableSorting: true,              // Enable column sorting
  loadingMessage: "Updating...",    // Loading overlay text
  theme: "quartz"                   // Grid theme (quartz, alpine, balham)
}
```

### Xano Integration
```javascript
{
  xanoEndpoint: "https://your-api.xano.app/api/endpoint",
  xanoHeaders: {                 // Optional custom headers
    "Authorization": "Bearer ..."
  }
}
```

## Events

### Cell Events
- `cellValueChanged`: Triggered when cell value changes
  ```javascript
  {
    field: "column_name",
    oldValue: "previous value",
    newValue: "new value",
    rowData: { /* full row data */ }
  }
  ```

### Grid Events
- `error`: Triggered on errors
  ```javascript
  {
    message: "Error message",
    type: "error"
  }
  ```
- `updateStart`: When update begins
- `updateComplete`: When update finishes

## Actions

### Grid Actions
- `refreshData`: Refresh grid data
- `exportToCSV`: Export grid data to CSV
- `clearSelection`: Clear row selection
- `retryUpdate`: Retry failed update

## State Management

### Grid State
```javascript
{
  isLoading: false,     // Loading state
  scriptLoaded: true,   // AG Grid script loaded
  cssLoaded: true,      // AG Grid CSS loaded
  filterModel: null,    // Current filter state
  sortModel: null       // Current sort state
}
```

## Examples

### Order Management Grid
```javascript
[
  {
    field: "order_id",
    headerName: "Order ID",
    dataType: "text",
    width: 120,
    editable: false
  },
  {
    field: "order_date",
    headerName: "Order Date",
    dataType: "timestamp",
    width: 150
  },
  {
    field: "status",
    headerName: "Status",
    dataType: "dropdown",
    dropdownOptions: ["Pending", "Processing", "Shipped", "Delivered"],
    width: 120
  },
  {
    field: "notes",
    headerName: "Notes",
    dataType: "richtext",
    width: 300,
    onClick: {
      workflowId: "edit-notes-workflow",
      type: "edit-notes"
    }
  }
]
```

### Customer Database Grid
```javascript
[
  {
    field: "active",
    headerName: "Active",
    dataType: "boolean",
    width: 80
  },
  {
    field: "name",
    headerName: "Customer Name",
    dataType: "text",
    width: 200
  },
  {
    field: "last_contact",
    headerName: "Last Contact",
    dataType: "timestamp",
    width: 150
  },
  {
    field: "membership",
    headerName: "Membership",
    dataType: "dropdown",
    dropdownOptions: ["Basic", "Premium", "Enterprise"],
    width: 120
  }
]
```

### Basic Mode
User-friendly configuration with simple options for common use cases.

### Advanced Mode
Full access to AG Grid features through code injection:

1. **Custom Grid Options**
```javascript
{
  // Enable row grouping
  groupDefaultExpanded: 1,
  autoGroupColumnDef: {
    headerName: 'Group',
    minWidth: 200
  },
  // Enable footer aggregation
  groupIncludeFooter: true
}
```

2. **Advanced Column Definitions**
```javascript
[
  {
    field: 'image',
    headerName: 'Profile',
    cellRenderer: params => `
      <div style="display: flex; align-items: center;">
        <img src="${params.value}" style="height: 30px; border-radius: 50%;"/>
        <span style="margin-left: 10px;">${params.data.name}</span>
      </div>
    `
  },
  {
    field: 'status',
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['Active', 'Pending', 'Inactive']
    }
  }
]
```

3. **Custom Event Handlers**
```javascript
{
  onRowSelected: params => {
    const selectedRows = params.api.getSelectedRows();
    wwLib.wwVariable.updateValue('selectedItems', selectedRows);
  },
  onCellValueChanged: params => {
    if (params.newValue && params.column.colId === 'email') {
      const isValid = /^[^@]+@[^@]+\.[^@]+$/.test(params.newValue);
      if (!isValid) {
        params.api.undoCellEditing();
        wwLib.wwNotification.open({
          text: 'Invalid email format',
          type: 'error'
        });
      }
    }
  }
}
```

## Common Properties
- `tableData`: Array of objects to display
- `theme`: Visual theme ('quartz', 'alpine', 'balham')
- `advancedMode`: Enable code injection mode

## Events
- `cellValueChanged`: Triggered on cell edits
- `rowSelected`: Triggered on row selection
- `error`: Triggered on errors

## Troubleshooting
1. **Data Not Displaying**
   - Check data format
   - Verify column field names
   - Check console for errors

2. **Custom Code Issues**
   - Validate JavaScript syntax
   - Ensure proper escaping
   - Check browser console

For more examples, visit [AG Grid Documentation](https://www.ag-grid.com/documentation/)
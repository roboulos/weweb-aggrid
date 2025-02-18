# AG Grid Component for WeWeb

A powerful and flexible AG Grid integration for WeWeb that supports both basic and advanced usage modes.

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

## Usage Modes

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
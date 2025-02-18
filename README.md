---
name: weweb-ag-grid-component
description: A customizable AG Grid component for WeWeb that integrates with Xano backend, supporting dynamic data binding, theme customization, and cell value updates
keywords: [ag-grid, table, grid, xano, data-grid, weweb]
---

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

Special features:
- Dynamic theme customization through CSS variables
- Automatic data updates on cell value changes
- Error handling with automatic rollback
- Loading state management
- CSV export capability
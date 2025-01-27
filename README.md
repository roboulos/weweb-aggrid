# AG Grid Enterprise Component

A powerful data grid component with smooth state transitions and enhanced loading states.

## Features
- Smooth loading transitions without white flashes
- State preservation during updates
- Debounced filter and pagination changes
- Real-time data updates
- Advanced filtering and sorting
- CSV export capabilities
- Row selection with state preservation
- Xano backend integration

## Component Documentation

### Properties
| Property | Description | Type | Bindable |
|----------|-------------|------|:--------:|
| tableData | Data array to display in grid | Array | Yes |
| columnDefs | Column definitions for the grid | Array | Yes |
| xanoEndpoint | Xano API endpoint for updates | Text | Yes |
| xanoHeaders | Custom headers for Xano API | Object | Yes |
| theme | Grid theme selection | TextSelect | Yes |
| pageSize | Number of rows per page | Number | Yes |
| enableFiltering | Enable column filters | OnOff | Yes |
| enableSorting | Enable column sorting | OnOff | Yes |
| loadingMessage | Message to show during updates | Text | Yes |

### Events
| Event | Description | Data |
|-------|-------------|------|
| cellValueChanged | Triggered when cell value changes | { field, oldValue, newValue, rowData } |
| rowSelected | Triggered when row is selected | { rowData } |
| error | Triggered on error | { message, type } |
| updateStart | Triggered when update starts | { rowData } |
| updateComplete | Triggered when update completes | { success, data } |

### Actions
| Action | Description | Arguments |
|--------|-------------|-----------|
| refreshData | Refresh grid data | None |
| exportToCSV | Export data to CSV | None |
| clearSelection | Clear row selection | None |

### Dependencies
- ag-grid-community: ^31.0.3
- lodash: ^4.17.21
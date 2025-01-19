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
| xanoEndpoint | Xano API endpoint for updates | String | Yes |
| xanoHeaders | Custom headers for Xano requests | Object | Yes |
| theme | Visual theme for the grid | String | Yes |
| pageSize | Number of rows per page | Number | Yes |
| enableFiltering | Enable column filtering | Boolean | Yes |
| enableSorting | Enable column sorting | Boolean | Yes |
| loadingMessage | Message displayed during loading | String | Yes |

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

### Usage

1. **Installation:**
   - Ensure all dependencies are installed by running `npm install`.

2. **Integration with WeWeb:**
   - Connect your WeWeb project to this GitHub repository.
   - Ensure the component path in `package.json` is set to `./src/CustomAgGrid.vue`.

3. **Xano Integration:**
   - Set the `xanoEndpoint` property to your Xano API endpoint URL for data updates.
   - Optionally, provide `xanoHeaders` for any custom headers required by your Xano API (e.g., authorization tokens).

4. **Customization:**
   - Customize the grid appearance by setting the `theme` property to one of the supported themes (e.g., `quartz`, `alpine`).
   - Adjust the grid's behavior using properties like `enableFiltering`, `enableSorting`, and `pageSize`.

5. **Event Handling:**
   - The component emits events such as `cellValueChanged`, `rowSelected`, and `error` for handling interactions and errors.

### Example

```html
<CustomAgGrid
  :tableData="myData"
  :columnDefs="myColumnDefs"
  xanoEndpoint="https://api.xano.io/v1/my-endpoint"
  :xanoHeaders="{ Authorization: 'Bearer my-token' }"
  theme="quartz"
  :pageSize="50"
  :enableFiltering="true"
  :enableSorting="true"
  loadingMessage="Loading data..."
/>

### Notes

- Ensure your Xano API is set up to handle the data structure and requests from the AG Grid component.
- Test the component thoroughly in your WeWeb environment to ensure all features work as expected.

### Dependencies
- ag-grid-community: ^31.0.3
- lodash: ^4.17.21
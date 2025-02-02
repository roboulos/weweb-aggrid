# AG Grid WeWeb Component

A powerful and customizable data grid component for WeWeb that integrates AG Grid with Xano backend support. This component provides enterprise-grade grid functionality with advanced theming capabilities, real-time updates, and smooth state management.

## Features
- Advanced data grid capabilities with AG Grid Community Edition
- Flexible theming system with support for AG Grid's Theming API
- Seamless Xano backend integration for real-time updates
- Smooth loading states and transitions
- State preservation during updates
- Advanced filtering and sorting with state persistence
- CSV export capabilities
- Multi-row selection with state management
- Responsive and mobile-friendly
- Customizable cell editors based on data types

## Component Properties

### Data and Backend
| Property | Description | Type | Default | Bindable |
|----------|-------------|------|---------|:--------:|
| tableData | Array of objects to display in the grid | Array | [] | Yes |
| columnDefs | Column definitions with formatting options | Array | [] | Yes |
| xanoEndpoint | Xano API endpoint for data updates | Text | "" | Yes |
| xanoHeaders | Custom headers for Xano API calls | Object | {} | Yes |
| pageSize | Number of rows per page | Number | 25 | Yes |

### Styling and Theming
| Property | Description | Type | Default | Bindable |
|----------|-------------|------|---------|:--------:|
| customTheme | AG Grid theme object (from Theme Builder/API) | Object | null | Yes |
| themeParams | Theme parameter overrides | Object | {} | Yes |
| theme | Legacy CSS theme name (if not using customTheme) | TextSelect | "quartz" | Yes |
| fontFamily | Grid font family | Text | "Arial, sans-serif" | Yes |
| rowHeight | Height of grid rows in pixels | Number | 25 | Yes |

### Behavior Controls
| Property | Description | Type | Default | Bindable |
|----------|-------------|------|---------|:--------:|
| enableFiltering | Enable column filters | Boolean | true | Yes |
| enableSorting | Enable column sorting | Boolean | true | Yes |
| loadingMessage | Message shown during updates | Text | "Updating..." | Yes |

## Column Definition Options
```javascript
{
  field: "fieldName",           // Data field to display
  headerName: "Column Header",  // Display name for column
  editable: true,              // Allow cell editing
  width: 100,                  // Column width
  sortable: true,              // Enable sorting
  filter: true,                // Enable filtering
  dataType: "text",           // Data type (text, timestamp, boolean, checkbox, dropdown)
  dropdownOptions: []         // Options for dropdown data type
}
```

## Events
| Event | Description | Event Data |
|-------|-------------|------------|
| cellValueChanged | Cell value updated | { field, oldValue, newValue, rowData } |
| rowSelected | Row selection changed | { rowData } |
| error | Error occurred | { message, type } |
| updateStart | Update operation started | { rowData } |
| updateComplete | Update operation finished | { success, data } |

## Actions
| Action | Description | Arguments |
|--------|-------------|-----------|
| refreshData | Refresh grid data | None |
| exportToCSV | Export data to CSV | None |
| clearSelection | Clear row selection | None |

## Theming
The component supports three ways to customize the grid's appearance:

1. **AG Grid Theme Builder**
   - Create a custom theme using AG Grid's Theme Builder
   - Pass the theme object via the `customTheme` property
   - Provides the most control over the grid's appearance

2. **Theme Parameters**
   - Override specific theme parameters via the `themeParams` property
   - Useful for quick customizations of the default theme
   - Example parameters:
     ```javascript
     {
       accentColor: "#0086F4",
       backgroundColor: "#F1EDE1",
       borderColor: "#98968F",
       headerBackgroundColor: "#E4DAD1",
       fontSize: 15
     }
     ```

3. **Legacy CSS Themes**
   - Use pre-built AG Grid themes via the `theme` property
   - Available options: "quartz", "alpine", "balham"
   - Limited customization compared to the Theme Builder approach

## Dependencies
- ag-grid-community: ^31.0.3
- lodash: ^4.17.21

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations
- Uses debounced updates to prevent excessive API calls
- Maintains filter and sort state during updates
- Efficient row virtualization for handling large datasets
- Optimized theme loading and resource management

## Error Handling
- Automatic retry mechanism for failed updates (up to 3 attempts)
- Graceful fallback for initialization failures
- Clear error messaging and state management
- Event emission for error tracking
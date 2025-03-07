# AG Grid Component Testing Guide

## Overview
This guide provides instructions for testing the AG Grid component with sample data. The sample data is designed to demonstrate all features of the component, including filtering, sorting, and preset filters.

## Version 1.3.1 Updates
- Fixed issues with quick filter (table-wide search)
- Fixed issues with preset filter buttons
- Added version display in the top-right corner of the component
- Added configuration option to toggle version display

## Sample Data Files
The `sample-data.js` file contains:
- Column definitions
- Row data (flat structure)
- Tree data (hierarchical structure)
- Preset filters
- Detail cell template for master-detail view

## Testing Instructions

### 1. Basic Setup

#### Column Definitions
```javascript
// Copy this into the "Column Definitions" field in WeWeb
sampleColumnDefs
```

#### Row Data
```javascript
// Copy this into the "Table Data" field in WeWeb
sampleRowData
```

### 2. Testing Quick Filter (Table-wide Search)

1. Enable the quick filter by checking "Enable Quick Filter" in the component settings
2. Type in the search box to filter across all columns
3. Try searching for terms like "development", "high", or "john"
4. The grid should filter in real-time as you type
5. Click the X button to clear the filter

### 3. Testing Preset Filters

1. Enable preset filters by checking "Enable Preset Filters" in the component settings
2. Add the following preset filters:

```javascript
// Copy this into the "Preset Filters" field in WeWeb
[
  {
    "label": "High Priority",
    "field": "priority",
    "value": "High",
    "operator": "equals",
    "color": "#ff4d4f"
  },
  {
    "label": "In Progress",
    "field": "status",
    "value": "In Progress",
    "operator": "equals",
    "color": "#1890ff"
  },
  {
    "label": "Development",
    "field": "category",
    "value": "Development",
    "operator": "equals",
    "color": "#52c41a"
  }
]
```

3. Click on each preset filter button to apply the filter
4. The grid should filter to show only rows matching the selected filter
5. Click on an active filter again or click "Clear Filters" to remove the filter

### 4. Testing Advanced Features

#### Master-Detail View
1. Enable master-detail view in the component settings
2. Use the sample detail cell template:

```html
<!-- Copy this into the "Detail Cell Template" field in WeWeb -->
<div class="detail-cell">
  <div class="detail-header">Task Details</div>
  <div class="detail-content">
    <div class="detail-row">
      <div class="detail-label">ID:</div>
      <div class="detail-value">{{data.id}}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Name:</div>
      <div class="detail-value">{{data.name}}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Category:</div>
      <div class="detail-value">{{data.category}}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Status:</div>
      <div class="detail-value">{{data.status}}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Date Created:</div>
      <div class="detail-value">{{data.dateCreated}}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Priority:</div>
      <div class="detail-value">{{data.priority}}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Assigned To:</div>
      <div class="detail-value">{{data.assignedTo}}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Description:</div>
      <div class="detail-value description">{{data.description}}</div>
    </div>
  </div>
</div>
```

#### Tree Data
1. Enable tree data mode in the component settings
2. Use the sample tree data:

```javascript
// Copy this into the "Table Data" field in WeWeb
sampleTreeData
```

3. Configure the tree data settings:
   - Group By Field: "children"
   - Group ID Field: "id"

### 5. Testing Version Display

1. The version number (v1.3.1) should be visible in the top-right corner of the component
2. You can toggle this display on/off using the "Show Version Number" setting

## Troubleshooting

If you encounter issues with the filters or other features:

1. Check the browser console for error messages
2. Ensure the column definitions match the data structure
3. Make sure the field names in preset filters match the column field names
4. Try refreshing the component or reloading the page
5. Verify that the component version is 1.3.1 by checking the version display

## Advanced Configuration

For advanced users, you can enable Advanced Mode and use custom AG Grid options:

```javascript
// Example custom grid options
{
  "defaultColDef": {
    "sortable": true,
    "filter": true,
    "resizable": true
  },
  "pagination": true,
  "paginationPageSize": 5,
  "rowSelection": "multiple"
}
```

This allows you to access the full power of AG Grid's configuration options.

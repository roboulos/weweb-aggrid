# Changelog

## v1.3.1 (2025-03-07)

### Bug Fixes

1. **Quick Filter Functionality**
   - Fixed issue where table-wide search was not responding to user input
   - Added direct method to apply filters immediately on input
   - Added improved error handling and logging for filter operations
   - Ensured proper initialization of the quick filter when the grid loads
   - Added event tracking to better diagnose input-related issues

2. **Preset Filter Buttons**
   - Fixed issue where preset filter buttons were not applying filters when clicked
   - Added enhanced click event handling with better logging
   - Implemented fallback mechanism when filter instances aren't found
   - Added direct filter model application as an alternative approach
   - Enhanced error reporting for easier troubleshooting

3. **General Improvements**
   - Added reset of filter state during grid initialization
   - Improved lifecycle management for filter operations
   - Enhanced debugging capabilities with detailed console logging

### New Features

1. **Version Display**
   - Added version number display in the top-right corner of the component
   - Added configuration option to toggle version display on/off
   - Improved visibility with subtle styling that doesn't interfere with content

2. **Sample Data**
   - Added comprehensive sample data for testing all component features
   - Included examples for column definitions, row data, and preset filters
   - Added detailed guide for testing different component configurations

## v1.3.0 (2025-03-07)

### Features Added

1. **Nested Rows (Tree Data)**
   - Added configuration options for enabling hierarchical data display
   - Implemented parent-child relationship support with configurable field names
   - Added automatic grouping and expansion of nested rows
   - Optimized for both flat data with parent references and hierarchical data structures

2. **Table-Wide Search (Quick Filter)**
   - Added a search box above the grid for filtering across all columns
   - Implemented real-time filtering as users type
   - Added clear button for resetting filters
   - Added 'quickFilterApplied' and 'quickFilterCleared' events

3. **Preset Filters**
   - Added configurable filter buttons that can be placed above the grid
   - Support for different filter operators (equals, contains, greater than, etc.)
   - Visual indication of active filters with customizable colors
   - Added 'presetFilterApplied' and 'presetFilterCleared' events

4. **Master-Detail View**
   - Added support for expandable detail rows to display additional information
   - Implemented customizable HTML templates for detail cells
   - Added data binding with {{data.fieldName}} syntax for dynamic content
   - Optimized styling for better readability and user experience

## v1.2.0 (2025-02-27)

### Features Added

1. **XANO Integration for Adding New Records**
   - Added a new "Xano Create Record Endpoint" configuration option
   - Implemented functionality to create new records via XANO API
   - Added "Add New Record" action that can be triggered from external buttons or events
   - Added "On record created" event that fires when a new record is successfully created
   - Maintained backward compatibility with local row addition when no endpoint is configured

## v1.1.0 (2025-02-27)

### Features Added

1. **Date Only Data Type**
   - Added a "date" option to the dataType selector
   - Implemented date-only handling that formats dates without time information
   - Added proper date editor configuration with appropriate format

2. **Row Deselection Event Handling**
   - Added a new "rowDeselected" trigger event
   - Modified grid options to handle both selection and deselection events
   - Added logic to detect when a row is deselected and emit the appropriate event

3. **Insert New Blank Rows**
   - Added a "Show Add Row Button" configuration option
   - Added a "rowAdded" trigger event
   - Implemented functionality to add new blank rows to the grid
   - Added scrolling to and focusing on the new row

4. **Improved Rich Text Field Display**
   - Enhanced styling (line height, max height, overflow handling)
   - Improved placeholder for empty fields
   - More robust HTML sanitization with fallback options
   - Preserved click handling for workflow integration

5. **Text Wrapping Control**
   - Added a "wrapText" property to column definitions
   - Implemented conditional styling for text wrapping
   - When enabled: normal white space, word breaking, and appropriate line height
   - When disabled: nowrap, hidden overflow, and ellipsis for text overflow

## v1.0.1 (Initial Release)

- Initial AG Grid component implementation

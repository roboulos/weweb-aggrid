# Changelog

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

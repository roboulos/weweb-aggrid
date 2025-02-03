# AG Grid Xano Component for WeWeb

This project provides a customizable AG Grid component for WeWeb that integrates with a Xano backend. It allows users to:
- Bind dynamic table data and column definitions.
- Update cell values by sending requests to a Xano endpoint.
- Customize the grid’s appearance via theme settings (e.g. accent color, background color, header colors, etc.).

The component leverages both AG Grid’s theming API and dynamic CSS injection to override legacy AG Grid styles with user-defined values.

---

## Table of Contents

- [Features](#features)
- [File Structure](#file-structure)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Component Properties (ww‑config.js)](#component-properties)
  - [Theme Overrides](#theme-overrides)
- [Usage](#usage)
- [Mechanics and Explanation](#mechanics-and-explanation)
  - [Dynamic Theme Overrides](#dynamic-theme-overrides)
  - [Data Binding & Xano Integration](#data-binding--xano-integration)
  - [AG Grid Initialization and Updates](#ag-grid-initialization-and-updates)
  - [Cleanup](#cleanup)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- **Dynamic Data Binding:**  
  Bind table data and column definitions from WeWeb. Updates to the bound data immediately reflect in the grid.
  
- **Xano Integration:**  
  When a cell value changes, the component automatically sends a POST request to a specified Xano endpoint. Custom headers can also be provided.
  
- **Customizable Appearance:**  
  Users can adjust key theme parameters such as accent color, background color, header background and text colors, and border color. These are applied via dynamic CSS injection and by merging with AG Grid’s default theme (`themeQuartz`).

- **Legacy Theme Fallback:**  
  If no custom theme parameters are provided, the component loads one of the legacy AG Grid themes (Quartz, Alpine, or Balham) based on the user's selection.

- **State Preservation:**  
  Debounced updates ensure that filter and sort state are preserved across data changes.

- **Cleanup:**  
  When the component is unmounted, it destroys the AG Grid instance and removes any dynamically injected style tags.

---

## File Structure

The project is organized as follows:

```
weweb-ag-grid-component/
├── .gitignore
├── package.json
├── package-lock.json
├── ww-config.js
└── src/
    └── CustomAgGrid.vue
```

- **package.json:** Defines the project metadata, dependencies, and the "`weweb`" property (which tells WeWeb which file to load as the component).
- **ww-config.js:** Contains the component configuration for WeWeb, exposing properties for data, settings, and theme overrides.
- **src/CustomAgGrid.vue:** The main Vue component that implements AG Grid functionality, theme override injection, and Xano integration.
- **.gitignore:** Ensures that build outputs, dependencies, and editor files are not committed.

---

## Installation

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd weweb-ag-grid-component
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Serve the Component Locally:**
   ```bash
   npm run serve
   ```
   The component should now be available on port 8081 (or the port you specified). Use this to test and verify that the component works as expected before pushing to GitHub.

---

## Configuration

### Component Properties

The component’s properties are defined in `ww-config.js`. Key properties include:

- **`tableData`**: An array of objects to be displayed in the grid.
- **`columnDefs`**: Array defining column configurations (including custom properties like `dataType` and `dropdownOptions` for extra formatting).
- **`xanoEndpoint` & `xanoHeaders`**: Settings for connecting to your Xano backend. When a cell value changes, the component sends the updated data to the endpoint.
- **`fontFamily`, `rowHeight`, `pageSize`, `enableFiltering`, `enableSorting`, `loadingMessage`**: Various grid settings.

### Theme Overrides

The following properties allow the user to customize the grid’s appearance:

- **`accentColor`**: The accent color (e.g. for icons or highlights).
- **`backgroundColor`**: The grid’s overall background.
- **`headerBackgroundColor`**: Background color for header cells.
- **`headerTextColor`**: Text color for header cells.
- **`borderColor`**: Border color for grid elements.
- **`theme`**: A fallback legacy theme (Quartz, Alpine, or Balham) if no custom overrides are provided.
- **`customTheme`**: Optionally, a full custom theme object (generated via AG Grid’s Theme Builder) can be provided.
- **`themeParams`**: Alternatively, you can provide theme parameter overrides to merge with the default `themeQuartz`.

---

## Usage

### Bind Data:
Use the WeWeb editor to bind your data arrays (for `tableData` and `columnDefs`) and objects (for current user, Xano settings, etc.) to the component.

### Customize Theme:
Use the theme override properties (`accentColor`, `backgroundColor`, `headerBackgroundColor`, `headerTextColor`, `borderColor`) to adjust the grid’s appearance. Changes are applied dynamically via the injected style block.

### Xano Integration:
Provide your Xano endpoint and any required headers. When a cell is edited, the component will send a POST request with the updated data.

### Legacy Theme Fallback:
If no custom theme overrides are provided, the component loads the legacy theme CSS based on the “theme” property (default: quartz).

### Actions & Events:
The component emits events such as `cellValueChanged`, `rowSelected`, `error`, etc. You can use these in WeWeb to trigger further actions (like refreshing data or handling errors).

---

## Mechanics and Explanation

### Dynamic Theme Overrides

#### Inline Style Computation:
The computed property `gridCustomStyles` builds an object mapping theme override properties (e.g. `accentColor`) to CSS custom properties (e.g. `--ag-accent-color`). These are applied inline to the grid container.

#### Dynamic Style Injection:
The `applyThemeOverrides()` function creates (or reuses) a `<style>` element in the document head that contains CSS rules targeting AG Grid’s legacy classes. These rules use the user-defined color values with `!important` to ensure they override the default styles.

#### Reactive Updates:
A watcher on the theme override properties ensures that any change immediately triggers a reapplication of the style rules.

### Data Binding & Xano Integration

#### Reactivity:
The component uses Vue’s reactive system (via `ref` and `watch`) to bind the grid data (`tableData`) and column definitions (`columnDefs`) so that changes are immediately reflected in the grid.

#### Backend Updates:
When a cell value changes, the component calls the Xano endpoint (if provided) using the `fetch` API. It sends a POST request with the updated row data and emits a `cellValueChanged` event on success or an `error` event if something goes wrong.

### AG Grid Initialization & State Preservation

#### Dynamic Resource Loading:
On mount, the component dynamically injects the AG Grid script and base CSS if they haven’t been loaded already.

#### Grid Options & Callbacks:
The component builds `gridOptions` that include column definitions, default column settings, pagination, and callbacks for filtering, sorting, and cell value changes. These options are passed to AG Grid when initializing.

#### Debounced Updates:
A debounced function (`debouncedGridUpdate`) preserves the grid’s filter and sort state when updating data.

### Cleanup

#### onBeforeUnmount:
The component ensures that the AG Grid instance is destroyed and that any dynamically injected `<style>` tags (for theme overrides and legacy themes) are removed to avoid side effects when the component is removed from the page.

---

## Troubleshooting

- **Component Not Displaying:**
  Verify that your file structure is correct and that `package.json` includes the correct "`weweb`": { "componentPath": "./src/CustomAgGrid.vue" }.

- **Theme Overrides Not Applying:**
  Check the browser console for errors. Ensure that the custom theme properties (e.g. `accentColor`) are provided and that the `applyThemeOverrides()` function is running (you should see a console log message). Verify that the dynamically injected style tag (`#custom-theme-overrides`) is present in the document head.

- **AG Grid Script Not Loading:**
  Ensure that the URL used to load AG Grid’s script is correct and that your network allows fetching from the CDN.

- **Xano Integration Issues:**
  Use your browser’s developer tools to inspect network requests when editing a cell. Confirm that the correct payload is sent and that the endpoint returns the expected JSON response.

---

## License

This project is licensed under the MIT License.

---

## Final Notes

This solution is built on the fundamental idea that AG Grid’s legacy CSS can be overridden by injecting custom styles (using a dynamic `<style>` tag) and that user settings can be passed via WeWeb’s configuration to adjust these styles at runtime. The component’s reactivity, combined with debounced updates and dynamic resource loading, ensures a stable and responsive grid.

Feel free to modify the theme override logic or add additional properties to suit your needs. If you have any questions or need further support, please refer to the AG Grid documentation or contact the maintainer.

Happy coding!
export default {
    editor: {
        label: {
            en: 'AG Grid Xano',
        },
        icon: 'table',
    },
    properties: {
        tableData: {
            label: { en: 'Table Data' },
            type: 'Array',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'Array',
                tooltip: 'Bind to an array of objects to display in the grid',
            },
            propertyHelp: {
                tooltip: 'The data to display in the grid',
            },
            /* wwEditor:end */
        },
        columnDefs: {
            label: { en: 'Column Definitions' },
            type: 'Array',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            options: {
                expandable: true,
                getItemLabel(_, index) {
                    return `Column ${index + 1}`;
                },
                item: {
                    type: 'Object',
                    defaultValue: {
                        field: '',
                        headerName: '',
                        editable: true
                    },
                    options: {
                        item: {
                            field: {
                                label: 'Field',
                                type: 'Text',
                                options: { placeholder: 'Data field name' }
                            },
                            headerName: {
                                label: 'Header',
                                type: 'Text',
                                options: { placeholder: 'Column header' }
                            },
                            editable: {
                                label: 'Editable',
                                type: 'OnOff',
                                defaultValue: true
                            }
                        }
                    }
                }
            },
            /* wwEditor:start */
            bindingValidation: {
                type: 'Array',
                tooltip: 'Array of column definitions for the grid',
            },
            propertyHelp: {
                tooltip: 'Define the columns to display in the grid',
            },
            /* wwEditor:end */
        },
        xanoEndpoint: {
            label: { en: 'Xano Update Endpoint' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: '',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'The Xano API endpoint URL for updating records',
            },
            propertyHelp: {
                tooltip: 'Enter the full URL of your Xano update endpoint',
            },
            /* wwEditor:end */
        },
        xanoHeaders: {
            label: { en: 'Xano Headers' },
            type: 'Object',
            section: 'settings',
            bindable: true,
            defaultValue: {},
            /* wwEditor:start */
            bindingValidation: {
                type: 'object',
                tooltip: 'Custom headers to send with Xano requests',
            },
            propertyHelp: {
                tooltip: 'Additional headers for Xano API calls (e.g., authorization)',
            },
            /* wwEditor:end */
        },
        theme: {
            label: { en: 'Grid Theme' },
            type: 'TextSelect',
            section: 'style',
            bindable: true,
            defaultValue: 'quartz',
            options: {
                options: [
                    { value: 'quartz', label: 'Quartz' },
                    { value: 'alpine', label: 'Alpine' },
                    { value: 'balham', label: 'Balham' }
                ]
            },
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'The visual theme for the grid',
            },
            propertyHelp: {
                tooltip: 'Select the visual style for the grid',
            },
            /* wwEditor:end */
        },
        pageSize: {
            label: { en: 'Page Size' },
            type: 'Number',
            section: 'settings',
            bindable: true,
            defaultValue: 25,
            options: {
                min: 1,
                max: 1000,
                step: 1
            },
            /* wwEditor:start */
            bindingValidation: {
                type: 'number',
                tooltip: 'Number of rows to display per page',
            },
            propertyHelp: {
                tooltip: 'Set how many rows to show on each page',
            },
            /* wwEditor:end */
        },
        enableFiltering: {
            label: { en: 'Enable Filtering' },
            type: 'OnOff',
            section: 'settings',
            bindable: true,
            defaultValue: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'Enable or disable column filtering',
            },
            propertyHelp: {
                tooltip: 'Allow users to filter data in columns',
            },
            /* wwEditor:end */
        },
        enableSorting: {
            label: { en: 'Enable Sorting' },
            type: 'OnOff',
            section: 'settings',
            bindable: true,
            defaultValue: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'Enable or disable column sorting',
            },
            propertyHelp: {
                tooltip: 'Allow users to sort data in columns',
            },
            /* wwEditor:end */
        },
        loadingMessage: {
            label: { en: 'Loading Message' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: 'Updating...',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Message to display during updates',
            },
            propertyHelp: {
                tooltip: 'Customize the loading message shown during updates',
            },
            /* wwEditor:end */
        }
    },
    triggerEvents: [
        {
            name: 'cellValueChanged',
            label: { en: 'On cell value changed' },
            event: { 
                field: '',
                oldValue: null,
                newValue: null,
                rowData: {}
            }
        },
        {
            name: 'rowSelected',
            label: { en: 'On row selected' },
            event: { rowData: {} }
        },
        {
            name: 'error',
            label: { en: 'On error' },
            event: { 
                message: '',
                type: ''
            }
        },
        {
            name: 'updateStart',
            label: { en: 'On update start' },
            event: { rowData: {} }
        },
        {
            name: 'updateComplete',
            label: { en: 'On update complete' },
            event: { 
                success: true,
                data: {}
            }
        }
    ],
    actions: [
        {
            name: 'refreshData',
            label: { en: 'Refresh Data' },
            action: 'refreshData'
        },
        {
            name: 'exportToCSV',
            label: { en: 'Export to CSV' },
            action: 'exportToCSV'
        },
        {
            name: 'clearSelection',
            label: { en: 'Clear Selection' },
            action: 'clearSelection'
        },
        {
            name: 'retryUpdate',
            label: { en: 'Retry Update' },
            action: 'retryUpdate'
        }
    ]
  };
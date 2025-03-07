// AG Grid Component Sample Data
// This file contains sample data to demonstrate all features of the AG Grid component

// Sample Column Definitions
const sampleColumnDefs = [
  {
    headerName: 'ID',
    field: 'id',
    width: 70,
    filter: 'agNumberColumnFilter',
    sortable: true,
    resizable: true
  },
  {
    headerName: 'Name',
    field: 'name',
    width: 150,
    filter: 'agTextColumnFilter',
    sortable: true,
    resizable: true
  },
  {
    headerName: 'Category',
    field: 'category',
    width: 120,
    filter: 'agTextColumnFilter',
    sortable: true,
    resizable: true
  },
  {
    headerName: 'Status',
    field: 'status',
    width: 100,
    filter: 'agTextColumnFilter',
    sortable: true,
    resizable: true
  },
  {
    headerName: 'Date Created',
    field: 'dateCreated',
    width: 150,
    filter: 'agDateColumnFilter',
    sortable: true,
    resizable: true,
    dataType: 'date'
  },
  {
    headerName: 'Priority',
    field: 'priority',
    width: 100,
    filter: 'agTextColumnFilter',
    sortable: true,
    resizable: true
  },
  {
    headerName: 'Assigned To',
    field: 'assignedTo',
    width: 150,
    filter: 'agTextColumnFilter',
    sortable: true,
    resizable: true
  },
  {
    headerName: 'Description',
    field: 'description',
    width: 250,
    filter: 'agTextColumnFilter',
    sortable: true,
    resizable: true,
    wrapText: true
  }
];

// Sample Row Data (Flat structure for basic grid)
const sampleRowData = [
  {
    id: 1,
    name: 'Task 1',
    category: 'Development',
    status: 'In Progress',
    dateCreated: '2025-01-15',
    priority: 'High',
    assignedTo: 'John Smith',
    description: 'Implement user authentication feature with OAuth integration and secure token handling.'
  },
  {
    id: 2,
    name: 'Task 2',
    category: 'Design',
    status: 'Completed',
    dateCreated: '2025-01-20',
    priority: 'Medium',
    assignedTo: 'Jane Doe',
    description: 'Create wireframes for the new dashboard layout.'
  },
  {
    id: 3,
    name: 'Task 3',
    category: 'Testing',
    status: 'Pending',
    dateCreated: '2025-01-25',
    priority: 'Low',
    assignedTo: 'Mike Johnson',
    description: 'Perform QA testing on the new feature set.'
  },
  {
    id: 4,
    name: 'Task 4',
    category: 'Development',
    status: 'In Progress',
    dateCreated: '2025-01-30',
    priority: 'High',
    assignedTo: 'Sarah Williams',
    description: 'Optimize database queries for better performance.'
  },
  {
    id: 5,
    name: 'Task 5',
    category: 'Marketing',
    status: 'Completed',
    dateCreated: '2025-02-05',
    priority: 'Medium',
    assignedTo: 'David Brown',
    description: 'Prepare content for social media campaign.'
  },
  {
    id: 6,
    name: 'Task 6',
    category: 'Design',
    status: 'Pending',
    dateCreated: '2025-02-10',
    priority: 'Low',
    assignedTo: 'Emily Davis',
    description: 'Design new icons for the mobile app.'
  },
  {
    id: 7,
    name: 'Task 7',
    category: 'Development',
    status: 'In Progress',
    dateCreated: '2025-02-15',
    priority: 'High',
    assignedTo: 'John Smith',
    description: 'Implement real-time notification system.'
  },
  {
    id: 8,
    name: 'Task 8',
    category: 'Testing',
    status: 'Completed',
    dateCreated: '2025-02-20',
    priority: 'Medium',
    assignedTo: 'Jane Doe',
    description: 'Conduct user acceptance testing for new features.'
  },
  {
    id: 9,
    name: 'Task 9',
    category: 'Marketing',
    status: 'Pending',
    dateCreated: '2025-02-25',
    priority: 'Low',
    assignedTo: 'Mike Johnson',
    description: 'Analyze marketing campaign results.'
  },
  {
    id: 10,
    name: 'Task 10',
    category: 'Development',
    status: 'In Progress',
    dateCreated: '2025-03-01',
    priority: 'High',
    assignedTo: 'Sarah Williams',
    description: 'Implement payment gateway integration.'
  }
];

// Sample Tree Data (Hierarchical structure for nested rows)
const sampleTreeData = [
  {
    id: 1,
    name: 'Project A',
    category: 'Development',
    status: 'In Progress',
    dateCreated: '2025-01-10',
    priority: 'High',
    assignedTo: 'Team Alpha',
    description: 'Main development project',
    children: 'Project A/Task 1,Project A/Task 2,Project A/Task 3'
  },
  {
    id: 2,
    name: 'Task 1',
    category: 'Backend',
    status: 'In Progress',
    dateCreated: '2025-01-15',
    priority: 'High',
    assignedTo: 'John Smith',
    description: 'Implement database schema',
    children: 'Project A/Task 1'
  },
  {
    id: 3,
    name: 'Task 2',
    category: 'Frontend',
    status: 'Pending',
    dateCreated: '2025-01-20',
    priority: 'Medium',
    assignedTo: 'Jane Doe',
    description: 'Design user interface',
    children: 'Project A/Task 2'
  },
  {
    id: 4,
    name: 'Task 3',
    category: 'Testing',
    status: 'Not Started',
    dateCreated: '2025-01-25',
    priority: 'Low',
    assignedTo: 'Mike Johnson',
    description: 'Create test cases',
    children: 'Project A/Task 3'
  },
  {
    id: 5,
    name: 'Project B',
    category: 'Design',
    status: 'In Progress',
    dateCreated: '2025-02-01',
    priority: 'Medium',
    assignedTo: 'Team Beta',
    description: 'Design project for new product',
    children: 'Project B/Task 1,Project B/Task 2'
  },
  {
    id: 6,
    name: 'Task 1',
    category: 'UX',
    status: 'In Progress',
    dateCreated: '2025-02-05',
    priority: 'High',
    assignedTo: 'Sarah Williams',
    description: 'Create wireframes',
    children: 'Project B/Task 1'
  },
  {
    id: 7,
    name: 'Task 2',
    category: 'UI',
    status: 'Pending',
    dateCreated: '2025-02-10',
    priority: 'Medium',
    assignedTo: 'David Brown',
    description: 'Design visual elements',
    children: 'Project B/Task 2'
  }
];

// Sample Preset Filters
const samplePresetFilters = [
  {
    label: 'High Priority',
    field: 'priority',
    value: 'High',
    operator: 'equals',
    color: '#ff4d4f'
  },
  {
    label: 'In Progress',
    field: 'status',
    value: 'In Progress',
    operator: 'equals',
    color: '#1890ff'
  },
  {
    label: 'Development',
    field: 'category',
    value: 'Development',
    operator: 'equals',
    color: '#52c41a'
  }
];

// Sample Detail Cell Template for Master-Detail View
const sampleDetailCellTemplate = `
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
`;

// Export all sample data
export {
  sampleColumnDefs,
  sampleRowData,
  sampleTreeData,
  samplePresetFilters,
  sampleDetailCellTemplate
};

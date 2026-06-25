import React, { useState, useEffect, useMemo } from 'react';
import Loading from "../../../../Components/loadingIndicator/loading"
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  CheckCircle,
  Users,
  Star,
  FileText,
  UserCog,
  Activity,
  SquareChartGantt,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  GanttChartSquareIcon,
} from 'lucide-react';

const ProjectManagement = ({ theme }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [filters, setFilters] = useState({
    projectType: '',
    difficulty: '',
    status: '',
    industry: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const resetFilters = () => {
    setFilters({
      projectType: '',
      difficulty: '',
      status: '',
      industry: '',
    });
    setGlobalFilter(''); // Reset search term
  };

  const projectTypes = [...new Set(projects.map(project => project.projectType))];
  const difficultyLevels = [...new Set(projects.map(project => project.difficultyLevel))];
  const statuses = [...new Set(projects.map(project => project.status))];
  const industries = [...new Set(projects.map(project => project.industryName))];

  // Fetch data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/admin/admin_project_data`)
      .then((res) => {
        setProjects(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load projects.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Calculate project progress
  const calculateProgress = (project) => {
    const steps = [
      { name: 'Approval', completed: project.approvals && project.approvals.length > 0 },
      { name: 'Supervisor Assigned', completed: project.supervisedBy && project.supervisedBy.length > 0 },
      { name: 'Student Selection', completed: project.studentSelection && project.studentSelection.length > 0 },
      { name: 'Submissions', completed: project.submissions && project.submissions.length > 0 },
      { name: 'Reviews', completed: project.reviews && project.reviews.length > 0 },
      {
        name: 'Student Selection Completed',
        completed: project.studentSelection &&
          project.studentSelection.length > 0 &&
          project.studentSelection[0].status &&
          project.studentSelection[0].status.isCompleted
      }
    ];

    const completedSteps = steps.filter(step => step.completed).length;
    const progress = Math.round((completedSteps / steps.length) * 100);

    let status;
    if (progress === 0) {
      status = 'Not Started';
    } else if (progress < 30) {
      status = 'Initial Stage';
    } else if (progress < 70) {
      status = 'In Progress';
    } else if (progress < 100) {
      status = 'Almost Complete';
    } else {
      status = 'Completed';
    }

    return {
      percentage: progress,
      status: status,
      completedSteps: completedSteps,
      totalSteps: steps.length,
      steps: steps
    };
  };

  // Define columns
  const columns = useMemo(() => [
    {
      accessorKey: 'title',
      header: 'Project Title',
      cell: ({ row, getValue }) => (
        <div className="flex flex-col">
          <span className="font-medium">{getValue()}</span>
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
            {row.original.description.substring(0, 50)}...
          </span>
        </div>
      ),
      size: 250,
    },
    {
      accessorKey: 'industryName',
      header: 'Industry',
      cell: ({ getValue }) => (
        <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-brand-900 text-brand-200' : 'bg-brand-100 text-brand-800'}`}>
          {getValue()}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'projectType',
      header: 'Type',
      cell: ({ getValue }) => (
        <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-brand-900 text-brand-200' : 'bg-brand-100 text-brand-800'}`}>
          {getValue()}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: 'difficultyLevel',
      header: 'Difficulty',
      cell: ({ getValue }) => {
        const difficulty = getValue();
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${difficulty === 'Easy' ?
            (theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') :
            difficulty === 'Moderate' ?
              (theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800') :
              (theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
            }`}>
            {difficulty}
          </span>
        );
      },
      size: 100,
    },
    {
      id: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const progress = calculateProgress(row.original);
        return (
          <div className="w-full">
            <div className="flex justify-between mb-1 text-xs">
              <span className="font-medium">
                {progress.percentage}%
              </span>
              <span className="font-medium">
                {progress.completedSteps}/{progress.totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${progress.percentage < 30 ? 'bg-red-500' :
                  progress.percentage < 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <span className="text-xs mt-1 block">{progress.status}</span>
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <span className={`px-2 py-1 text-xs rounded-full ${getValue() === 'active' ?
          (theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') :
          (theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800')
          }`}>
          {getValue()}
        </span>
      ),
      size: 80,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpandProject(row.original._id);
            }}
            className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {expandedProject === row.original._id ? (
              <X className="w-4 h-4" />
            ) : (
              <MoreVertical className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
      size: 40,
    },
  ], [theme, expandedProject]);

  // Initialize table
  const filteredData = useMemo(() => {
    return projects.filter(project => {
      return (
        (!filters.projectType || project.projectType === filters.projectType) &&
        (!filters.difficulty || project.difficultyLevel === filters.difficulty) &&
        (!filters.status || project.status === filters.status) &&
        (!filters.industry || project.industryName === filters.industry)
      );
    });
  }, [projects, filters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });

  // Toggle project details expansion
  const toggleExpandProject = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      {/* Top Heading Section */}
      <div className={`p-6 rounded-b-xl ${theme === "dark" ? "bg-gradient-to-r from-gray-800 to-gray-900" : "bg-gradient-to-r from-white to-gray-50"}`}>
        <div className="">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-brand-50"}`}>
              <GanttChartSquareIcon className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-accent-500">
                Project Management
              </h1>
              <p className={`text-sm flex items-center gap-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                <Activity className="w-4 h-4" />
                Manage users, verify, or block them with ease
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                className={`pl-10 pr-10 py-2.5 w-full rounded-lg border ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-brand-500 focus:ring-brand-500'
                  : 'bg-white border-gray-200 focus:border-brand-400 focus:ring-brand-400'}
    focus:ring-1 focus:outline-none`}
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(String(e.target.value))}
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-brand-400' : 'text-brand-600'}`}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide filters' : 'Show filters'}
            </button>

            {/* Filters Panel */}
            {showFilters && (
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-end mb-3">
                  <button
                    onClick={resetFilters}
                    className={`text-sm px-3 py-1.5 rounded-md flex items-center gap-1 
          ${theme === 'dark'
                        ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                  >
                    <X className="w-4 h-4" />
                    Reset Filters
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Project Type Filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Project Type
                    </label>
                    <select
                      className={`w-full pl-3 pr-8 py-2 rounded-lg border text-sm ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                      value={filters.projectType}
                      onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
                    >

                      <option value="">All Types</option>
                      {projectTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Difficulty
                    </label>
                    <select
                      className={`w-full pl-3 pr-8 py-2 rounded-lg border text-sm ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                      value={filters.difficulty}
                      onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    >
                      <option value="">All Levels</option>
                      {difficultyLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      className={`w-full pl-3 pr-8 py-2 rounded-lg border text-sm ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="">All Statuses</option>
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  {/* Industry Filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Industry
                    </label>
                    <select
                      className={`w-full pl-3 pr-8 py-2 rounded-lg border text-sm ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                      value={filters.industry}
                      onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                    >
                      <option value="">All Industries</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className={`mt-6 rounded-xl overflow-hidden shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                          }`}
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? 'cursor-pointer select-none flex items-center'
                                : '',
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <ChevronUp className="ml-1 h-4 w-4" />,
                              desc: <ChevronDown className="ml-1 h-4 w-4" />,
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                {table.getRowModel().rows.map(row => (
                  <React.Fragment key={row.id}>
                    <tr
                      className={`${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer`}
                      onClick={() => toggleExpandProject(row.original._id)}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>

                    {/* Expanded Details */}
                    {expandedProject === row.original._id && (
                      <tr>
                        <td colSpan={columns.length} className={`px-4 py-4 ${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}`}>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Project Details Card */}
                            <div className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold flex items-center gap-2">
                                  <FileText className="w-5 h-5" />
                                  <span>Project Details</span>
                                </h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                  ID: {row.original._id}
                                </span>
                              </div>

                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Start Date</p>
                                    <p className="font-medium">
                                      {new Date(row.original.duration.startDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>End Date</p>
                                    <p className="font-medium">
                                      {new Date(row.original.duration.endDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Max Groups</p>
                                    <p className="font-medium">{row.original.maxGroups}</p>
                                  </div>
                                  <div>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Students/Group</p>
                                    <p className="font-medium">{row.original.maxStudentsPerGroup}</p>
                                  </div>
                                </div>

                                <div>
                                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Description</p>
                                  <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {row.original.description}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Progress Tracking Card */}
                            <div className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                              <h3 className="font-bold flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5" />
                                <span>Progress Tracking</span>
                              </h3>

                              <div className="space-y-5">
                                {/* Approval Status */}
                                <div>
                                  <h4 className="font-medium mb-2 flex items-center gap-1">
                                    <UserCog className="w-4 h-4" />
                                    <span>Approval Status</span>
                                  </h4>
                                  {row.original.approvals && row.original.approvals.length > 0 ? (
                                    <div className={`space-y-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} p-3 rounded-lg`}>
                                      {row.original.approvals.map((approval, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                          <div>
                                            <p className="font-medium">{approval.fullName}</p>
                                            {approval.comments && (
                                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {approval.comments}
                                              </p>
                                            )}
                                          </div>
                                          <span className={`px-2 py-1 text-xs rounded-full ${approval.status === 'approved' ?
                                            (theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') :
                                            (theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                                            }`}>
                                            {approval.status}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className={`text-center py-3 ${theme === 'dark' ? 'bg-gray-600 text-gray-400' : 'bg-gray-50 text-gray-500'} rounded-lg`}>
                                      No approvals yet
                                    </div>
                                  )}
                                </div>

                                {/* Student Groups */}
                                <div>
                                  <h4 className="font-medium mb-2 flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>Student Groups</span>
                                  </h4>
                                  {row.original.studentSelection && row.original.studentSelection.length > 0 ? (
                                    <div className={`space-y-3 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} p-3 rounded-lg`}>
                                      {row.original.studentSelection.map((group, idx) => (
                                        <div key={idx} className="border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium">Group {idx + 1}</span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${group.status.isCompleted ?
                                              (theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') :
                                              (theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800')
                                              }`}>
                                              {group.status.isCompleted ? 'Completed' : 'In Progress'}
                                            </span>
                                          </div>
                                          <div className="text-xs">
                                            <p className="font-medium">Leader: <span className="font-normal">{group.groupLeader}</span></p>
                                            <p>Members: {group.groupMembers.join(', ')}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className={`text-center py-3 ${theme === 'dark' ? 'bg-gray-600 text-gray-400' : 'bg-gray-50 text-gray-500'} rounded-lg`}>
                                      No student groups assigned yet
                                    </div>
                                  )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className={`p-3 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'}`}>
                                    <div>
                                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Submissions</p>
                                      <p className="text-lg font-bold">{row.original.submissions ? row.original.submissions.length : 0}</p>
                                    </div>
                                    <FileText className={`w-5 h-5 ${theme === 'dark' ? 'text-brand-400' : 'text-brand-500'}`} />
                                  </div>
                                  <div className={`p-3 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'}`}>
                                    <div>
                                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Avg Rating</p>
                                      <p className="text-lg font-bold">{row.original.averageRating || 'N/A'}</p>
                                    </div>
                                    <Star className={`w-5 h-5 text-yellow-500`} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className={`mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-sm">
            Showing{' '}
            <span className="font-medium">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>{' '}
            of <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> projects
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${!table.getCanPreviousPage() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, table.getPageCount()) }).map((_, i) => {
                const pageIndex = table.getState().pagination.pageIndex;
                let displayIndex;

                // Show pages around current page
                if (table.getPageCount() <= 5) {
                  displayIndex = i;
                } else if (pageIndex <= 2) {
                  displayIndex = i;
                } else if (pageIndex >= table.getPageCount() - 3) {
                  displayIndex = table.getPageCount() - 5 + i;
                } else {
                  displayIndex = pageIndex - 2 + i;
                }

                return (
                  <button
                    key={displayIndex}
                    className={`w-8 h-8 rounded-md text-sm ${table.getState().pagination.pageIndex === displayIndex
                      ? `${theme === 'dark' ? 'bg-brand-600 text-white' : 'bg-brand-500 text-white'}`
                      : `${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                      }`}
                    onClick={() => table.setPageIndex(displayIndex)}
                  >
                    {displayIndex + 1}
                  </button>
                );
              })}

              {table.getPageCount() > 5 && (
                <span className="px-2">...</span>
              )}
            </div>

            <button
              className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${!table.getCanNextPage() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;
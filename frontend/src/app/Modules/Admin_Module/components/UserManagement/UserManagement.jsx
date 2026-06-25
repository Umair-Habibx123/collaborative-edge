import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import RolePieChart from "../overview/Charts/RolePieChart.jsx";
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { Activity, Plus, Filter, ChevronRight, ChevronsLeft, ArrowDown, ArrowUp, FolderSearch, Search, PieChart, FileSpreadsheet, FileText, UserCog, X, UserPlus, ChevronsRight, ChevronLeft, ArrowUpDown, Eye, Edit, Loader2, UserCircle2 } from "lucide-react";
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import ViewModal from "./Modal/view_modal.jsx";
import { useNavigate } from "react-router-dom";

import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import TypeLightSansFont from '../../../../../fonts/TypeLightSans.otf'; // Adjust the path if needed


const UserManagement = ({ theme }) => {
    const [users, setUsers] = useState([]);
    const [roleData, setRoleData] = useState(null); // State for role data
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [sorting, setSorting] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [isSelectedOption, setIsSelectedOption] = useState(false);

    const [hasLoaded, setHasLoaded] = useState(false);
    const [isFetching, setIsFetching] = useState(false);



    const exportToExcel = (data, fileName) => {
        // Convert data with all fields, ensuring dates are properly formatted
        const formattedData = data.map(user => ({
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic
                ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${user.profilePic}`
                : "N/A",
            role: user.role,
            status: user.status,
            createdAt: getFormattedDate(user.createdAt),
            updatedAt: getFormattedDate(user.updatedAt),
        }));

        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

        // Convert to binary and trigger download
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.xlsx`;
        link.click();

        // Clean up
        URL.revokeObjectURL(link.href);
    };




    const generatePdfReport = async (data) => {
        // Convert OTF font to Base64
        const toBase64 = async (url) => {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(blob);
            });
        };

        const TypeLightSansFontBase64 = await toBase64(TypeLightSansFont);

        if (!pdfMake.vfs) {
            pdfMake.vfs = {};
        }

        pdfMake.vfs['TypeLightSans.otf'] = TypeLightSansFontBase64;
        pdfMake.fonts = {
            TypeLightSans: {
                normal: 'TypeLightSans.otf',
                bold: 'TypeLightSans.otf',
                italics: 'TypeLightSans.otf',
                bolditalics: 'TypeLightSans.otf',
            },
        };



        const docDefinition = {
            content: [
                { text: 'User Management Report', style: 'header' },
                { text: '\n\n' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            ['Username', 'Email', 'Profile Pic', 'Role', 'Status', 'Created At', 'Updated At'],
                            ...data.map(user => [
                                { text: user.username, noWrap: true },
                                { text: user.email, noWrap: true },
                                {
                                    text: user.profilePic
                                        ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${user.profilePic}`
                                        : "N/A",
                                    link: user.profilePic
                                        ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${user.profilePic}`
                                        : undefined,
                                    color: user.profilePic ? 'blue' : 'black'
                                },
                                { text: user.role, alignment: 'center' },
                                { text: user.status, alignment: 'center' },
                                {
                                    text: getFormattedDate(user.createdAt),
                                    alignment: 'center'
                                },
                                {
                                    text: getFormattedDate(user.updatedAt),
                                    alignment: 'center'
                                }
                            ]),
                        ],
                    },
                    layout: 'lightHorizontalLines',
                },
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: 'center',
                },
            },
            defaultStyle: {
                font: 'TypeLightSans',
            },
            pageSize: 'A4',
            pageOrientation: 'landscape',
        };

        pdfMake.createPdf(docDefinition).download('users_report.pdf');
    };

    const getFormattedDate = (dateObj) => {
        if (!dateObj) return "N/A";
        // Check if dateObj is a string or an object
        const dateString = typeof dateObj === 'string'
            ? dateObj
            : dateObj?.$date || dateObj;

        try {
            return new Date(dateString).toLocaleString();
        } catch (e) {
            console.error("Invalid date format:", dateObj);
            return "Invalid Date";
        }
    };




    const handleOptionSelect = (option) => {
        setIsSelectedOption(false);
        switch (option) {
            case 'student':
                navigate('/add-student-user', { state: { theme } });
                break;
            case 'teacher':
                navigate('/add-teacher-user', { state: { theme } });
                break;
            case 'industry':
                navigate('/add-industry-user', { state: { theme } });
                break;
            case 'admin':
                navigate('/add-admin', { state: { theme } });
                break;
            default:
                break;
        }
    };
    const categoryLabels = {
        all: "Users",
        industry: "Industry Representative Users",
        teacher: "Teacher Users",
        student: "Student Users",
        admin: "Admin Users",
    };
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            setIsFetching(true);
            setHasLoaded(false);

            try {
                // Fetch both data in parallel
                const [usersResponse, rolesResponse] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/admin/fetchRoleBasedUsers`, {
                        params: { role: categoryFilter }
                    }),
                    fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/roles`).then(res => res.json())
                ]);

                setUsers(usersResponse.data);
                setRoleData(rolesResponse);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
                setIsFetching(false);
                setHasLoaded(true);
            }
        };

        fetchAllData();
    }, [categoryFilter]); // Only categoryFilter as dependency since roles don't change


    const filteredUsers = React.useMemo(() => {
        return users.filter((user) => {
            const matchesStatus = statusFilter === "all" || user.status === statusFilter;
            const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesStatus && matchesSearch;
        });
    }, [users, statusFilter, searchTerm]);

    const columns = React.useMemo(
        () => [
            {
                accessorKey: "profilePic",
                header: "Profile",
                cell: (info) => {
                    return (
                        <div className="flex items-center">
                            {info.row.original.profilePic ? (
                                <div className="relative w-10 h-10">
                                    {isLoading && (
                                        <Loader2 className="w-10 h-10 text-white animate-spin absolute inset-0 m-auto" />
                                    )}
                                    <img
                                        src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${info.row.original.profilePic}`}
                                        onLoad={() => setIsLoading(false)} // Hide spinner on load
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "fallback-image-url"; // Fallback image
                                            setIsLoading(false); // Hide spinner even if image fails
                                        }}
                                        alt="Profile"
                                        className={`w-10 h-10 rounded-full object-cover transition-opacity ${isLoading ? "opacity-0" : "opacity-100"
                                            }`}
                                    />
                                </div>
                            ) : (
                                <UserCircle2 className="w-10 h-10 text-gray-400 mr-2" />
                            )}
                        </div>
                    );
                },
                enableSorting: false, // Disable sorting for this column
            },
            {
                accessorKey: "username",
                header: "Username",
                cell: (info) => info.row.original.username,
                sortingFn: 'alphanumeric', // Enable sorting for this column
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: (info) => info.row.original.email,
                enableSorting: false, // Disable sorting for this column
            },
            {
                accessorKey: "role",
                header: "Role",
                cell: (info) => info.row.original.role,
                enableSorting: false, // Disable sorting for this column
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: (info) => info.row.original.status,
                enableSorting: false, // Disable sorting for this column
            },
            {
                accessorKey: "createdAt",
                header: "Created At",
                cell: (info) => new Date(info.row.original.createdAt).toLocaleDateString(),
                sortingFn: 'datetime', // Enable sorting for this column
            },
            {
                accessorKey: "updatedAt",
                header: "Updated At",
                cell: (info) => new Date(info.row.original.updatedAt).toLocaleDateString(),
                enableSorting: false, // Disable sorting for this column
            },
            {
                id: "actions",
                header: "Actions",
                cell: (info) => (
                    <div className="flex space-x-2">
                        <button
                            className="text-brand-500 hover:text-brand-700"
                            onClick={() => handleView(info.row.original)}
                        >
                            <Eye className="mr-2" />
                        </button>
                        <button
                            className="text-yellow-500 hover:text-yellow-700"
                            onClick={() => {
                                const role = info.row.original.role;
                                let route = "/";

                                switch (role) {
                                    case "industry":
                                        route = `/editRepScreen/${info.row.original._id}`;
                                        break;
                                    case "teacher":
                                        route = `/editTechScreen/${info.row.original._id}`;
                                        break;
                                    case "student":
                                        route = `/editStdScreen/${info.row.original._id}`;
                                        break;
                                    case "admin":
                                        route = `/editAdmScreen/${info.row.original._id}`;
                                        break;
                                    default:
                                        route = `/${info.row.original._id}`; // Fallback route
                                }

                                navigate(route);
                            }}
                        >
                            <Edit className="mr-2" />
                        </button>

                    </div>
                ),
                enableSorting: false, // Disable sorting for this column
            },
        ],
        [isLoading, navigate]
    );


    const handleView = (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const table = useReactTable({
        columns,
        data: filteredUsers.slice(
            pagination.pageIndex * pagination.pageSize,
            (pagination.pageIndex + 1) * pagination.pageSize
        ),
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            pagination,
            sorting,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        manualPagination: true,
        pageCount: Math.ceil(filteredUsers.length / pagination.pageSize),
    });

    const { getHeaderGroups, getRowModel } = table;

    const headerGroups = getHeaderGroups();
    const rows = getRowModel().rows;

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
            {/* Top Heading Section */}
            <div className={`p-6 rounded-b-xl ${theme === "dark" ? "bg-gradient-to-r from-gray-800 to-gray-900" : "bg-gradient-to-r from-white to-gray-50"}`}>
                <div className="">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-brand-50"}`}>
                            <UserCog className="w-6 h-6 text-brand-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-accent-500">
                                {categoryLabels[categoryFilter]} Management
                            </h1>
                            <p className={`text-sm flex items-center gap-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                <Activity className="w-4 h-4" />
                                Manage users, verify, or block them with ease
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="px-4 sm:px-6 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sidebar for Graphs and Filters */}
                    <div className={`w-full lg:w-1/4 p-5 rounded-xl border ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-sm`}>
                        <button
                            className={`mb-6 w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 ${theme === "dark" ? "bg-brand-600 hover:bg-brand-700" : "bg-brand-500 hover:bg-brand-600"} text-white hover:shadow-lg font-medium`}
                            onClick={() => setIsSelectedOption(true)}
                        >
                            <Plus className="w-5 h-5" />
                            Add New User
                        </button>

                        {/* Category Filter */}
                        <div className="mb-6">
                            <label className={`flex items-center gap-2 text-sm font-medium mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                <Filter className="w-4 h-4" />
                                Filter by Category
                            </label>
                            <select
                                className={`w-full p-3 rounded-lg border transition-all duration-300 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                <option value="industry">Industry Representative Users</option>
                                <option value="teacher">Teacher Users</option>
                                <option value="student">Student Users</option>
                                <option value="admin">Admin Users</option>
                            </select>
                        </div>

                        {/* Export Buttons */}
                        <div className="mb-6 space-y-3">
                            <button
                                className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg ${theme === "dark" ? "bg-brand-600 hover:bg-brand-700" : "bg-brand-500 hover:bg-brand-600"} text-white transition-colors`}
                                onClick={() => generatePdfReport(filteredUsers)}
                            >
                                <FileText className="w-5 h-5" />
                                Generate Report
                            </button>
                            <button
                                className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"} transition-colors`}
                                onClick={() => exportToExcel(filteredUsers, 'users_export')}
                            >
                                <FileSpreadsheet className="w-5 h-5" />
                                Export Data
                            </button>
                        </div>

                        {/* Analytics Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <PieChart className="w-5 h-5 text-brand-500" />
                                <h3 className="font-medium">User Role Distribution</h3>
                            </div>
                            <div className="h-64">
                                <RolePieChart data={roleData} theme={theme} />
                            </div>
                        </div>
                    </div>

                    {/* Right Section - User Management */}
                    <div className={`flex-1 p-5 rounded-xl border ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-sm`}>
                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <div className={`absolute inset-y-0 left-0 flex items-center pl-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    <Search className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by username or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Status Filter */}
                            <div>
                                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                    <Filter className="w-4 h-4" />
                                    Status
                                </label>
                                <select
                                    className={`w-full p-2.5 rounded-lg border ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    <option value="verified">Verified</option>
                                    <option value="pending">Pending</option>
                                    <option value="banned">Banned</option>
                                </select>
                            </div>

                            {/* Sort Filter */}
                            <div>
                                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                    <ArrowUpDown className="w-4 h-4" />
                                    Sort By
                                </label>
                                <select
                                    className={`w-full p-2.5 rounded-lg border ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                                    onChange={(e) => {
                                        const sortBy = e.target.value;
                                        if (sortBy === "name") {
                                            setSorting([{ id: "username", desc: false }]);
                                        } else if (sortBy === "date") {
                                            setSorting([{ id: "createdAt", desc: false }]);
                                        }
                                    }}
                                >
                                    <option value="name">Name</option>
                                    <option value="date">Date</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border">
                            {isLoading ? (
                                <div className={`p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                                    <div className="space-y-4">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-16 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                                                    } animate-pulse`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            ) : hasLoaded && filteredUsers.length === 0 ? (
                                <div
                                    className={`text-center py-12 ${theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-white text-gray-700"
                                        }`}
                                >
                                    <FolderSearch className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg font-medium">No users found</p>
                                    <p className="text-sm">Try adjusting your search or filters</p>
                                </div>
                            ) : (
                                // Table with loading indicator
                                <div className="relative">
                                    {isFetching && (
                                        // Beautiful overlay loading indicator
                                        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-10">
                                            <div className="flex flex-col items-center">
                                                <div className="relative">
                                                    {/* Animated spinner */}
                                                    <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-brand-500 animate-spin"></div>
                                                    {/* Optional: Pulse animation */}
                                                    <div className="absolute inset-0 rounded-full bg-brand-500 opacity-20 animate-ping"></div>
                                                </div>
                                                <p
                                                    className={`mt-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                                                        }`}
                                                >
                                                    Updating data...
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <table className="min-w-full divide-y">
                                        <thead
                                            className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                                                }`}
                                        >
                                            {headerGroups.map((headerGroup) => (
                                                <tr key={headerGroup.id}>
                                                    {headerGroup.headers.map((header) => (
                                                        <th
                                                            key={header.id}
                                                            className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"
                                                                }`}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
                                                            <div className="flex items-center gap-1 cursor-pointer">
                                                                {header.column.columnDef.header}
                                                                {header.column.getIsSorted() && (
                                                                    <span>
                                                                        {header.column.getIsSorted() === "asc" ? (
                                                                            <ArrowUp className="w-3 h-3" />
                                                                        ) : (
                                                                            <ArrowDown className="w-3 h-3" />
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            ))}
                                        </thead>
                                        <tbody
                                            className={`divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"
                                                }`}
                                        >
                                            {rows.map((row, index) => (
                                                <tr
                                                    key={row.id}
                                                    className={`${index % 2 === 0
                                                        ? theme === "dark"
                                                            ? "bg-gray-800"
                                                            : "bg-gray-50"
                                                        : theme === "dark"
                                                            ? "bg-gray-800"
                                                            : "bg-white"
                                                        } hover:${theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                                                        }`}
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <td
                                                            key={cell.id}
                                                            className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                                                                }`}
                                                        >
                                                            {cell.column.columnDef.cell({ row })}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            {isLoading ? (
                                <div className={`h-8 w-32 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} animate-pulse`}></div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                        Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
                                        {Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredUsers.length)} of{' '}
                                        {filteredUsers.length} entries
                                    </span>
                                    <select
                                        value={pagination.pageSize}
                                        onChange={(e) => setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value), pageIndex: 0 }))}
                                        className={`p-2 rounded-lg border ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                                    >
                                        {[10, 20, 50, 100].map((size) => (
                                            <option key={size} value={size}>
                                                Show {size}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
                                    disabled={pagination.pageIndex === 0}
                                    className={`p-2 rounded-lg border ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"} ${pagination.pageIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                >
                                    <ChevronsLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                                    disabled={pagination.pageIndex === 0}
                                    className={`p-2 rounded-lg border ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"} ${pagination.pageIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                                    disabled={pagination.pageIndex >= Math.ceil(filteredUsers.length / pagination.pageSize) - 1}
                                    className={`p-2 rounded-lg border ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"} ${pagination.pageIndex >= Math.ceil(filteredUsers.length / pagination.pageSize) - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setPagination((prev) => ({ ...prev, pageIndex: Math.ceil(filteredUsers.length / pagination.pageSize) - 1 }))}
                                    disabled={pagination.pageIndex >= Math.ceil(filteredUsers.length / pagination.pageSize) - 1}
                                    className={`p-2 rounded-lg border ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"} ${pagination.pageIndex >= Math.ceil(filteredUsers.length / pagination.pageSize) - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                >
                                    <ChevronsRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {isViewModalOpen && (
                <ViewModal
                    user={selectedUser}
                    onClose={() => setIsViewModalOpen(false)}
                    theme={theme}
                />
            )}

            {/* Add User Modal */}
            {isSelectedOption && (
                <div className={`fixed inset-0 ${theme === "dark" ? "bg-black/50" : "bg-black/50"} backdrop-blur-sm flex items-center justify-center z-50`}
                    onClick={() => setIsSelectedOption(false)}
                >
                    <div className={`${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"} p-6 rounded-xl shadow-xl relative w-full max-w-md`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={() => setIsSelectedOption(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <UserPlus className="w-6 h-6 text-brand-500" />
                            <h2 className="text-xl font-bold">Add New User</h2>
                        </div>

                        <div className="space-y-3">
                            <button
                                className={`flex items-center justify-between w-full p-4 rounded-lg ${theme === "dark" ? "bg-brand-600 hover:bg-brand-700" : "bg-brand-500 hover:bg-brand-600"} text-white transition-colors`}
                                onClick={() => handleOptionSelect('student')}
                            >
                                <span className="font-medium">Student</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                                className={`flex items-center justify-between w-full p-4 rounded-lg ${theme === "dark" ? "bg-brand-600 hover:bg-brand-700" : "bg-brand-500 hover:bg-brand-600"} text-white transition-colors`}
                                onClick={() => handleOptionSelect('teacher')}
                            >
                                <span className="font-medium">Teacher</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                                className={`flex items-center justify-between w-full p-4 rounded-lg ${theme === "dark" ? "bg-brand-600 hover:bg-brand-700" : "bg-brand-500 hover:bg-brand-600"} text-white transition-colors`}
                                onClick={() => handleOptionSelect('industry')}
                            >
                                <span className="font-medium">Industry</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                                className={`flex items-center justify-between w-full p-4 rounded-lg ${theme === "dark" ? "bg-brand-600 hover:bg-brand-700" : "bg-brand-500 hover:bg-brand-600"} text-white transition-colors`}
                                onClick={() => handleOptionSelect('admin')}
                            >
                                <span className="font-medium">Admin</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


UserManagement.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default UserManagement;
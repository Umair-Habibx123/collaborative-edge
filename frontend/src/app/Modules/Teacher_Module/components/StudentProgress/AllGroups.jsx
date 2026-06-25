import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import { User, ChevronLeft, FileText, CheckCircle, AlertCircle, Users, Award, Calendar, ArrowRight, Search, Filter, ChevronDown, ChevronUp, Star, ClipboardList, Lock, ArrowLeft, LogIn } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const AllGroups = () => {
    const { projectId_evaluation } = useParams();
    const projectId = projectId_evaluation.split('_')[0];
    const { user, isAuthLoading } = useAuth();
    const [project, setProject] = useState({ studentSelection: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invalidProjectSearch, setInvalidProjectSearch] = useState(false);
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState({
        overall: "all",
        industry: "all",
        teacher: "all"
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [canAccess, setCanAccess] = useState(true);
    const [extensionRequest, setExtensionRequest] = useState(null);
    const [loadingExtension, setLoadingExtension] = useState(true);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const [projectDetail, setProjectDetail] = useState(null);
    const [hasForwardedRequest, setHasForwardedRequest] = useState(false);


    const checkExistingExtensionRequest = async (projectId, userId) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/check-extension-request/${projectId}/${userId}`
            );
            if (!response.ok) throw new Error("Failed to check extension requests");
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error checking extension requests:", error);
            return { exists: false };
        }
    };

    const checkForwardedExtensionRequest = async (projectId, userId) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/check-forwarded-request/${projectId}/${userId}`
            );
            if (!response.ok) throw new Error("Failed to check forwarded requests");
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error checking forwarded requests:", error);
            return { forwarded: false };
        }
    };

    const checkExtensionStatus = async (projectId, userId) => {
        try {
            setLoadingExtension(true);

            // Run both checks in parallel
            const [existingReq, forwardedReq] = await Promise.all([
                checkExistingExtensionRequest(projectId, userId),
                checkForwardedExtensionRequest(projectId, userId)
            ]);

            // Update state based on both responses
            setHasPendingRequest(existingReq.exists);
            setHasForwardedRequest(forwardedReq.forwarded);

            // If there's an existing request, set the extension request details
            if (existingReq.exists) {
                setExtensionRequest({
                    notificationId: existingReq.request?.notificationId,
                    requestedBy: existingReq.request?.requestedBy,
                    date: existingReq.request?.date,
                    reason: existingReq.request?.reason,
                    submittedAt: existingReq.request?.submittedAt,
                    status: existingReq.request?.status
                });
            }

            return {
                hasPending: existingReq.exists,
                hasForwarded: forwardedReq.forwarded
            };
        } catch (error) {
            console.error("Error checking extension status:", error);
            return { hasPending: false, hasForwarded: false };
        } finally {
            setLoadingExtension(false);
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Set loading states
                setIsLoading(true);
                setLoadingExtension(true);
                setError(null);
                setInvalidProjectSearch(false);

                // 1. First fetch basic project details
                const projectResponse = await fetch(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchProjectDetailById/${projectId}`
                );
                const projectData = await projectResponse.json();

                if (projectData.message === "Project not found") {
                    setProject("Project not found");
                    setInvalidProjectSearch(true);
                    setIsLoading(false);
                    setLoadingExtension(false);
                    return; // Exit early if project not found
                }

                setProjectDetail(projectData);


                // Set initial project data
                setProject(prev => ({
                    ...prev,
                    ...projectData,
                    studentSelection: [] // Initialize empty array for groups
                }));

                // 2. Fetch extension requests (both pending and existing)
                const fetchExtensionRequests = async () => {
                    try {
                        // Check pending extension request
                        const pendingResponse = await axios.get(
                            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/check-pending-extension/${projectId}/${user.email}`
                        );
                        setExtensionRequest(pendingResponse.data.hasPending ? pendingResponse.data.requestDetails : null);

                        console.log(pendingResponse.data.hasPending);
                        // Check existing request if user email exists
                        if (user?.email) {
                            const existingResult = await checkExtensionStatus(projectId, user.email);

                            if (existingResult.exists) {
                                setExtensionRequest(existingResult.request);
                                setHasPendingRequest(true);
                            } else {
                                setHasPendingRequest(false);
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching extension requests:", error);
                    }
                };

                await fetchExtensionRequests();

                // 3. Check teacher supervision status if user data is available
                if (user?.email && user?.teacherDetails?.university) {
                    try {
                        const supervisionResponse = await axios.post(
                            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/currentTeacherSupervisionStatusForProject`,
                            {
                                projectId,
                                email: user.email,
                                university: user.teacherDetails.university
                            }
                        );

                        const canAccessNow = supervisionResponse.data.status === "approved";
                        setCanAccess(canAccessNow);

                        // 4. Only fetch detailed project info if access is granted
                        if (canAccessNow) {
                            try {
                                const detailsResponse = await axios.get(
                                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getAllSelectionGroupsForTeachers`,
                                    {
                                        params: {
                                            university: user.teacherDetails.university,
                                            projectId
                                        }
                                    }
                                );

                                if (detailsResponse.data?.message === "No matching selection groups found") {
                                    // Keep existing project data but with empty studentSelection
                                    setProject(prev => ({
                                        ...prev,
                                        studentSelection: []
                                    }));
                                } else {
                                    // Merge new data with existing project data
                                    setProject(prev => ({
                                        ...prev,
                                        ...detailsResponse.data
                                    }));
                                }
                            } catch (err) {
                                console.error("Error fetching groups:", err);
                                if (err.response?.status === 404 && err.response.data?.message === "No matching selection groups found") {
                                    // No groups found is not an error - just set empty array
                                    setProject(prev => ({
                                        ...prev,
                                        studentSelection: []
                                    }));
                                } else {
                                    // Real error occurred
                                    setError("Failed to load group data");
                                }
                            }
                        }
                    } catch (err) {
                        console.error("Error checking supervision status:", err);
                        setCanAccess(false);
                        if (err.response?.status === 404) {
                            setError("You are not approved to supervise this project");
                        } else {
                            setError("Failed to verify your access permissions");
                        }
                    }
                }
            } catch (err) {
                console.error("Error in data fetching:", err);
                setError("Failed to load project data");
            } finally {
                setIsLoading(false);
                setLoadingExtension(false);
            }
        };

        fetchAllData();
    }, [projectId, user?.email, user?.teacherDetails?.university]);



    const getUniqueStudents = (selection) => {
        const uniqueEmails = new Set();
        return selection.students.filter(student => {
            if (!uniqueEmails.has(student.email)) {
                uniqueEmails.add(student.email);
                return true;
            }
            return false;
        });
    };

    const filteredGroups = project?.studentSelection?.filter(selection => {
        const matchesSearch = searchTerm === "" ||
            selection.selectionId.toString().includes(searchTerm.toLowerCase()) ||
            selection.students.some(student =>
                student.username.toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesOverallStatus = statusFilter.overall === "all" ||
            (statusFilter.overall === "completed" && selection.status.isCompleted) ||
            (statusFilter.overall === "pending" && !selection.status.isCompleted);

        const matchesIndustryStatus = statusFilter.industry === "all" ||
            (statusFilter.industry === "completed" && selection.status.IndustryCompleted) ||
            (statusFilter.industry === "pending" && !selection.status.IndustryCompleted);

        const matchesTeacherStatus = statusFilter.teacher === "all" ||
            (statusFilter.teacher === "completed" && selection.status.TeacherCompleted) ||
            (statusFilter.teacher === "pending" && !selection.status.TeacherCompleted);


        return matchesSearch && matchesOverallStatus && matchesIndustryStatus && matchesTeacherStatus;
    }) || [];

    if (!user || isLoading || canAccess === null || isAuthLoading) {
        return <Loading />;
    }

    const isDurationExceeded = (endDate) => {
        if (!endDate) return false;
        const today = new Date();
        const projectEndDate = new Date(endDate);
        return today > projectEndDate;
    };


    if (!user || !user.email) {
        return (
            <div className={`-mt-[70px] md:-mt-[90px] min-h-screen flex items-center justify-center p-6 ${theme === "dark" ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-900"}`}>
                <div className={`${theme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-gray-100 to-gray-200"} p-8 md:p-12 rounded-2xl shadow-2xl max-w-lg w-full text-center transition-all duration-300`}>
                    <div className="flex items-center justify-center mb-6">
                        {/* Icon or Image */}
                        <Lock className="w-16 h-16 text-red-500 animate-pulse" />
                    </div>
                    <h2 className="text-4xl font-extrabold mb-4">Access Restricted</h2>
                    <p className="text-lg mb-6">You must be logged in to view this content.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className={`px-6 py-3 ${theme === "dark" ? "bg-gradient-to-r from-brand-600 to-brand-700" : "bg-gradient-to-r from-brand-500 to-brand-600"} text-white rounded-lg hover:from-brand-600 hover:to-brand-700 transition-all duration-300 shadow-lg font-semibold flex items-center justify-center mx-auto`}
                    >
                        <LogIn className="w-5 h-5 mr-2" />
                        Log In
                    </button>
                </div>
            </div>
        );
    }


    if (invalidProjectSearch || user.role !== "teacher" || !canAccess) {
        return (
            <div className={`-mt-[70px] md:-mt-[90px] min-h-screen flex items-center justify-center p-6 ${theme === "dark" ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-900"}`}>
                <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white dark:from-gray-900 dark:to-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl max-w-lg w-full text-center transition-all duration-300">
                    <div className="flex items-center justify-center mb-6">
                        <Lock className="w-16 h-16 text-red-500 animate-pulse" />
                    </div>
                    <h2 className="text-4xl font-extrabold mb-4">Access Denied</h2>
                    <p className="text-lg mb-6">You do not have permission to view this project.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg font-semibold  flex items-center justify-center mx-auto"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-[50vh] p-8 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
                <div className={`p-4 rounded-full ${theme === "dark" ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600"}`}>
                    <AlertCircle className="w-12 h-12" />
                </div>
                <p className="text-xl font-medium mt-4 text-center">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className={`mt-6 px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${theme === "dark" ? "bg-gray-800 hover:bg-gray-700 text-brand-400" : "bg-gray-100 hover:bg-gray-200 text-brand-600"}`}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!project) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-[50vh] p-8 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
                <div className={`p-4 rounded-full ${theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                    <FileText className="w-12 h-12" />
                </div>
                <p className="text-xl font-medium mt-4">Project not found</p>
                <button
                    onClick={() => navigate(-1)}
                    className={`mt-6 px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${theme === "dark" ? "bg-gray-800 hover:bg-gray-700 text-brand-400" : "bg-gray-100 hover:bg-gray-200 text-brand-600"}`}
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Projects
                </button>
            </div>
        );
    }

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <div className={`-mt-[70px] md:-mt-[90px] min-h-screen p-4 md:p-8 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"}`}>
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handleBackClick}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${theme === "dark" ? "hover:bg-gray-800/50 text-brand-400" : "hover:bg-gray-100 text-brand-600"}`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-medium">Back</span>
                        </button>

                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${theme === "dark" ? "bg-gray-800/50" : "bg-white shadow"}`}>
                            <Users className="w-5 h-5" />
                            <span className="font-medium">{filteredGroups.length} {filteredGroups.length === 1 ? 'Group' : 'Groups'}</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
                                Project Groups
                            </span>
                        </h1>
                        <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Manage and evaluate student groups for this project
                        </p>
                    </div>


                    {extensionRequest && new Date(projectDetail.duration.endDate) < new Date() && (
                        <div className={`mb-6 p-4 rounded-lg ${theme === "dark" ? "bg-yellow-900/20 border border-yellow-800" : "bg-yellow-50 border border-yellow-100"}`}>
                            <div className="flex items-start gap-4">
                                <AlertCircle className={`w-6 h-6 mt-0.5 flex-shrink-0 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`} />
                                <div className="flex-1">
                                    <h3 className={`font-semibold ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"}`}>
                                        Date Extension Request Pending
                                    </h3>
                                    <div className={`mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
                                        <div>
                                            <p><span className="font-medium">Requested by:</span> {extensionRequest.requestedBy}</p>
                                            <p><span className="font-medium">New end date:</span> {new Date(extensionRequest.date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p><span className="font-medium">Reason:</span> {extensionRequest.reason}</p>
                                            <p><span className="font-medium">Submitted:</span> {new Date(extensionRequest.submittedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                            disabled={hasPendingRequest || hasForwardedRequest || loadingExtension}
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/forward-extension-request`, {
                                                        method: "POST",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify({
                                                            notificationId: extensionRequest.notificationId,
                                                            teacherId: user.email,
                                                            decision: "approved",
                                                            newEndDate: extensionRequest.date,
                                                            comment: "Forwarded for industry representative approval"
                                                        }),
                                                    });

                                                    if (!response.ok) throw new Error("Failed to forward request");

                                                    const data = await response.json();
                                                    toast.success("Request forwarded successfully");

                                                    // Refresh the status after forwarding
                                                    await checkExtensionStatus(projectId, user.email);
                                                } catch (error) {
                                                    console.error("Error forwarding request:", error);
                                                    toast.error("Failed to forward request");
                                                }
                                            }}
                                            className={`px-4 py-2 rounded-md font-medium ${loadingExtension
                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    : hasPendingRequest || hasForwardedRequest
                                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        : theme === "dark"
                                                            ? "bg-brand-900/50 hover:bg-brand-900/70 text-brand-300"
                                                            : "bg-brand-100 hover:bg-brand-200 text-brand-700"
                                                }`}
                                        >
                                            {loadingExtension
                                                ? "Checking..."
                                                : hasPendingRequest
                                                    ? "Extension Request Pending"
                                                    : hasForwardedRequest
                                                        ? "Request Forwarded"
                                                        : "Forward to Industry Representative"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Search and Filter Section */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search Input - Full width on mobile, flex-1 on desktop */}
                    <div className={`relative w-full md:flex-1 ${theme === "dark" ? "bg-gray-800/50" : "bg-white"} rounded-lg shadow transition-all`}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search groups or students..."
                            className={`w-full pl-10 pr-4 py-3 rounded-lg ${theme === "dark" ? "bg-gray-800/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500/50" : "bg-white text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-brand-500/50"} border-none focus:outline-none transition-all`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Button and Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center justify-center md:justify-between gap-2 w-full md:w-48 px-4 py-3 rounded-lg ${theme === "dark" ? "bg-gray-800/50 hover:bg-gray-800" : "bg-white hover:bg-gray-50"} shadow transition-all`}
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                <span className="font-medium">Filter</span>
                            </div>
                            {isFilterOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>

                        {/* Dropdown - Full width on mobile, fixed width on desktop */}
                        {isFilterOpen && (
                            <div className={`absolute md:right-0 mt-2 w-full md:w-80 rounded-lg shadow-lg z-10 ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
                                <div className="p-2 max-h-[70vh] overflow-y-auto">
                                    {/* Filter sections with grid layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {/* Overall Status */}
                                        <div className="space-y-1">
                                            <h4 className={`px-3 py-1 text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Overall</h4>
                                            {["all", "completed", "pending"].map((status) => (
                                                <label key={status} className={`flex items-center px-3 py-1.5 rounded-md text-sm ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"} cursor-pointer`}>
                                                    <input
                                                        type="radio"
                                                        className="mr-2"
                                                        name="overallStatus"
                                                        value={status}
                                                        checked={statusFilter.overall === status}
                                                        onChange={() => setStatusFilter({ ...statusFilter, overall: status })}
                                                    />
                                                    {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                                                </label>
                                            ))}
                                        </div>

                                        {/* Industry Status */}
                                        <div className="space-y-1">
                                            <h4 className={`px-3 py-1 text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Industry</h4>
                                            {["all", "completed", "pending"].map((status) => (
                                                <label key={status} className={`flex items-center px-3 py-1.5 rounded-md text-sm ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"} cursor-pointer`}>
                                                    <input
                                                        type="radio"
                                                        className="mr-2"
                                                        name="industryStatus"
                                                        value={status}
                                                        checked={statusFilter.industry === status}
                                                        onChange={() => setStatusFilter({ ...statusFilter, industry: status })}
                                                    />
                                                    {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                                                </label>
                                            ))}
                                        </div>

                                        {/* Teacher Status */}
                                        <div className="space-y-1">
                                            <h4 className={`px-3 py-1 text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Teacher</h4>
                                            {["all", "completed", "pending"].map((status) => (
                                                <label key={status} className={`flex items-center px-3 py-1.5 rounded-md text-sm ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"} cursor-pointer`}>
                                                    <input
                                                        type="radio"
                                                        className="mr-2"
                                                        name="teacherStatus"
                                                        value={status}
                                                        checked={statusFilter.teacher === status}
                                                        onChange={() => setStatusFilter({ ...statusFilter, teacher: status })}
                                                    />
                                                    {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                                                </label>
                                            ))}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* Active Filters Display */}
                {(statusFilter.overall !== "all" || statusFilter.industry !== "all" || statusFilter.teacher !== "all") && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {Object.entries(statusFilter).map(([key, value]) => {
                            if (value === "all") return null;

                            return (
                                <div
                                    key={key}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${theme === "dark" ? "bg-brand-900/30 text-brand-300" : "bg-brand-100 text-brand-600"}`}
                                >
                                    <span>{key}: {value}</span>
                                    <button
                                        onClick={() => setStatusFilter(prev => ({ ...prev, [key]: "all" }))}
                                        className="focus:outline-none"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}


                {/* Main Content */}
                <div className="mb-6">
                    <div className="relative flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-xl ${theme === "dark" ? "bg-brand-900/30 text-brand-400" : "bg-brand-100 text-brand-600"}`}>
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-semibold">Evaluation Groups</h2>

                        {isDurationExceeded(project.duration?.endDate) && (
                            <span className={`text-xs px-2 py-1 rounded-full -translate-y-1/2 ${theme === "dark" ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"}`}>
                                End Date Exceeded
                            </span>
                        )}


                    </div>


                    {!isLoading && filteredGroups.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center p-12 rounded-xl text-center ${theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white shadow border border-gray-200"}`}>
                            <div className={`p-4 rounded-full mb-4 ${theme === "dark" ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"}`}>
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-medium mb-2">
                                No Groups Formed Yet
                            </h3>
                            <p className={`max-w-md ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                Student groups will appear here once they&apos;re created for this project.
                            </p>
                        </div>
                    ) : (
                        <div className={`rounded-xl overflow-hidden shadow ${theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200"}`}>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                                            <th className="px-6 py-4 text-left font-medium">Group</th>
                                            <th className="px-6 py-4 text-left font-medium">Members</th>
                                            <th className="px-6 py-4 text-left font-medium">Created</th>
                                            <th className="px-6 py-4 text-left font-medium">Status</th>
                                            <th className="px-6 py-4 text-right font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredGroups.map((selection) => {
                                            const uniqueStudents = getUniqueStudents(selection);
                                            return (
                                                <tr
                                                    key={selection.selectionId}
                                                    className={`border-b ${theme === "dark" ? "border-gray-700 hover:bg-gray-800/30" : "border-gray-100 hover:bg-gray-50"}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium">Group {selection.selectionId}</p>
                                                            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                                                {uniqueStudents.length} member{uniqueStudents.length !== 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="flex -space-x-2 mr-3">
                                                                {uniqueStudents.slice(0, 4).map((student, index) => (
                                                                    student.profilePic ? (
                                                                        <img
                                                                            key={index}
                                                                            src={student.profilePic}
                                                                            alt={student.username}
                                                                            className="w-8 h-8 rounded-full border-2 object-cover"
                                                                            style={{ borderColor: theme === "dark" ? "#1f2937" : "#f9fafb" }}
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            key={index}
                                                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${theme === "dark" ? "bg-gray-700 border-gray-800 text-gray-300" : "bg-gray-200 border-gray-50 text-gray-600"}`}
                                                                        >
                                                                            <User className="w-4 h-4" />
                                                                        </div>
                                                                    )
                                                                ))}
                                                            </div>
                                                            {uniqueStudents.length > 4 && (
                                                                <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                                                    +{uniqueStudents.length - 4} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 opacity-70" />
                                                            <span className="text-sm">
                                                                {new Date(selection.joinedAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-2">
                                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${selection.status.isCompleted ?
                                                                (theme === "dark" ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700") :
                                                                (theme === "dark" ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-700")}`}>
                                                                {selection.status.isCompleted ? (
                                                                    <>
                                                                        <CheckCircle className="w-4 h-4" />
                                                                        <span>Overall Completed</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <AlertCircle className="w-4 h-4" />
                                                                        <span>Overall Pending</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme === 'dark'
                                                                        ? selection.status.IndustryCompleted
                                                                            ? 'bg-brand-800 text-brand-200'
                                                                            : 'bg-gray-700 text-gray-300'
                                                                        : selection.status.IndustryCompleted
                                                                            ? 'bg-brand-100 text-brand-800'
                                                                            : 'bg-gray-100 text-gray-600'
                                                                        }`}
                                                                >
                                                                    {selection.status.IndustryCompleted ? 'Industry ✓' : 'Industry Pending'}
                                                                </span>
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme === 'dark'
                                                                        ? selection.status.TeacherCompleted
                                                                            ? 'bg-brand-800 text-brand-200'
                                                                            : 'bg-gray-700 text-gray-300'
                                                                        : selection.status.TeacherCompleted
                                                                            ? 'bg-brand-100 text-brand-800'
                                                                            : 'bg-gray-100 text-gray-600'
                                                                        }`}
                                                                >
                                                                    {selection.status.TeacherCompleted ? 'Teacher ✓' : 'Teacher Pending'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => navigate(`/evaluation/${projectId}/${selection.selectionId}`)}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${theme === "dark" ?
                                                                "bg-brand-900/30 hover:bg-brand-900/50 text-brand-300 hover:text-white" :
                                                                "bg-brand-100 hover:bg-brand-200 text-brand-600 hover:text-brand-700"} shadow-sm`}
                                                        >
                                                            {selection.isCompleted ? "View Results" : "Evaluate"}
                                                            <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                    }
                </div>
            </div>
        </div>
    );
};

AllGroups.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default AllGroups;
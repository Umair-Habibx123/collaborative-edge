import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import { User, ChevronLeft, FileText, CheckCircle, AlertCircle, Users, Lock, LogIn, Calendar, ArrowRight, Search, Filter, ChevronDown, ChevronUp, ArrowLeft, ClipboardList, School } from "lucide-react";
import { toast, ToastContainer } from "react-toastify"


const AllGroups = () => {
    const { projectId } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [projectData, setProjectData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState({
        overall: "all",
        industry: "all",
        teacher: "all"
    });
    const [universityFilter, setUniversityFilter] = useState("all");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [availableUniversities, setAvailableUniversities] = useState([]);
    const [loadingExtension, setLoadingExtension] = useState(true);
    const [extensionRequest, setExtensionRequest] = useState(null);
    const [projectDetail, setProjectDetail] = useState(null);
    const [firstSelectionId, setFirstSelectionId] = useState(null);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const [isDateExpired, setIsDateExpired] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [customEndDate, setCustomEndDate] = useState("");
    const [useCustomDate, setUseCustomDate] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    const checkExistingExtensionRequest = async (projectId, userId) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/check-extension-request/${projectId}/${userId}`
            );
            if (!response.ok) throw new Error("Failed to check extension requests");
            return await response.json();
        } catch (error) {
            console.error("Error checking extension requests:", error);
            return { exists: false };
        } finally {
            setLoadingExtension(false);
        }
    };

    useEffect(() => {
        fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchProjectDetailById/${projectId}`)
            .then((res) => res.json())
            .then((data) => {
                setProjectData(data);
                // Check if project end date has passed
                if (data?.duration?.endDate) {
                    const endDate = new Date(data.duration.endDate);
                    const today = new Date();
                    setIsDateExpired(today > endDate);
                }
            })
            .catch((err) => console.error("Error fetching project details:", err));
    }, [projectId]);



    useEffect(() => {
        setLoadingExtension(true);

        const fetchProjectDetails = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getAllSelectionGroups`,
                    {
                        params: {
                            projectId: projectId
                        }
                    }
                );

                if (response.data?.message === "No selection groups found for this project") {
                    setProject({
                        ...response.data,
                        studentSelection: []
                    });
                } else {
                    setProject(response.data);
                    if (response.data.studentSelection.length > 0) {
                        const firstSelectionId = response.data.studentSelection[0].selectionId;
                        setFirstSelectionId(firstSelectionId);
                    }
                }

                if (response.data?.studentSelection) {
                    const universities = [...new Set(
                        response.data.studentSelection.map(selection => selection.university)
                    )];
                    setAvailableUniversities(universities);
                }
            } catch (err) {
                console.error("Error fetching project details:", err);
                if (err.response?.data?.message !== "No selection groups found for this project") {
                    setError("Failed to load project details");
                } else {
                    setProject({
                        studentSelection: []
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        const fetchExtensionRequests = async () => {
            try {
                if (user?.email) {
                    const existingResult = await checkExistingExtensionRequest(projectId, user.email);
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

        if (projectId && user?.email) {
            fetchProjectDetails();
            fetchExtensionRequests();
        }
    }, [projectId, user]);



    const handleApproveExtension = async () => {
        try {
            setIsApproving(true);

            let newEndDate;

            if (useCustomDate && customEndDate) {
                newEndDate = customEndDate;
            } else {
                newEndDate = extensionRequest.date;
            }

            console.log(newEndDate);


            const notificationResponse = await fetch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/respond-to-extension`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        notificationId: extensionRequest.notificationId,
                        representativeId: user.email,
                        decision: "approved",
                        requestedEndDate: newEndDate, // Add this line to send the new date
                    }),
                }
            );

            if (!notificationResponse.ok) {
                const errorData = await notificationResponse.json();
                throw new Error(errorData.message || "Failed to process extension approval");
            }

            const responseData = await notificationResponse.json();
            const updatedProject = responseData.updatedProject;

            setProjectData(prev => ({
                ...prev,
                duration: {
                    ...prev.duration,
                    endDate: newEndDate
                }
            }));

            toast.success("Extension request approved successfully");
            setExtensionRequest(null);
            setHasPendingRequest(false);
            setShowApproveModal(false);
            setCustomEndDate("");
            setUseCustomDate(false);
            setIsDateExpired(false);

        } catch (error) {
            console.error("Error approving extension:", error);
            toast.error(error.message || "Failed to approve extension request");
        } finally {
            setIsApproving(false);
        }
    };


    const handleRejectExtension = async () => {
        try {
            setIsApproving(true);


            const notificationResponse = await fetch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/respond-to-extension`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        notificationId: extensionRequest.notificationId,
                        representativeId: user.email,
                        decision: "rejected",
                    }),
                }
            );

            if (!notificationResponse.ok) {
                const errorData = await notificationResponse.json();
                throw new Error(errorData.message || "Failed to process extension approval");
            }

            toast.success("Extension request rejected successfully");
            setExtensionRequest(null);
            setHasPendingRequest(false);
            setShowApproveModal(false);
            setCustomEndDate("");
            setUseCustomDate(false);
            setIsDateExpired(false);

        } catch (error) {
            console.error("Error approving extension:", error);
            toast.error(error.message || "Failed to approve extension request");
        } finally {
            setIsApproving(false);
        }
    };

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

     const isDurationExceeded = (endDate) => {
        if (!endDate) return false;
        const today = new Date();
        const projectEndDate = new Date(endDate);
        return today > projectEndDate;
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

        const matchesUniversity = universityFilter === "all" ||
            selection.university === universityFilter;

        return matchesSearch && matchesOverallStatus && matchesIndustryStatus && matchesTeacherStatus && matchesUniversity;
    }) || [];

    if (isLoading || !projectData) {
        return <Loading />;
    }

    // Show error only if it's not the "no groups found" case
    if (error && (!project || project.studentSelection?.length !== 0)) {
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

    if (!user || !user.email) {
        return (
            <div className={`-mt-[70px] md:-mt-[90px] min-h-screen flex items-center justify-center p-6 ${theme === "dark" ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-900"}`}>
                <div className={`${theme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-gray-100 to-gray-200"} p-8 md:p-12 rounded-2xl shadow-2xl max-w-lg w-full text-center transition-all duration-300`}>
                    <div className="flex items-center justify-center mb-6">
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

    // Check if the logged-in user is the project owner/ uploader
    if (user.email !== projectData.representativeId || user.role !== "industry") {
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

    return (
        <div className={`-mt-[70px] md:-mt-[90px] min-h-screen p-4 md:p-8 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"}`}>
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate(-1)}
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




                    {isDateExpired && extensionRequest && extensionRequest.isRecipient && (
                        <div className={`mb-6 p-4 rounded-lg ${theme === "dark" ? "bg-yellow-900/20 border border-yellow-800" : "bg-yellow-50 border border-yellow-100"}`}>
                            <div className="flex items-start gap-4">
                                <AlertCircle className={`w-6 h-6 mt-0.5 flex-shrink-0 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`} />
                                <div className="flex-1">
                                    <h3 className={`font-semibold ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"}`}>
                                        Date Extension Request
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
                                            onClick={() => setShowApproveModal(true)}
                                            className={`px-4 py-2 rounded-md font-medium ${theme === "dark" ? "bg-green-900/50 hover:bg-green-900/70 text-green-300" : "bg-green-100 hover:bg-green-200 text-green-700"}`}
                                        >
                                            Approve Extension
                                        </button>
                                        <button
                                            onClick={handleRejectExtension}
                                            className={`px-4 py-2 rounded-md font-medium ${theme === "dark" ? "bg-red-900/50 hover:bg-red-900/70 text-red-300" : "bg-red-100 hover:bg-red-200 text-red-700"}`}
                                        >

                                            {isApproving ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </>
                                            ) : "Reject Extension"}
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

                                        {/* University - Full width */}
                                        <div className="md:col-span-2 space-y-1">
                                            <h4 className={`px-3 py-1 text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>University</h4>
                                            <label className={`flex items-center px-3 py-1.5 rounded-md text-sm ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"} cursor-pointer`}>
                                                <input
                                                    type="radio"
                                                    className="mr-2"
                                                    name="universityFilter"
                                                    value="all"
                                                    checked={universityFilter === "all"}
                                                    onChange={() => setUniversityFilter("all")}
                                                />
                                                All Universities
                                            </label>
                                            {availableUniversities.map((uni) => (
                                                <label key={uni} className={`flex items-center px-3 py-1.5 rounded-md text-sm ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"} cursor-pointer`}>
                                                    <input
                                                        type="radio"
                                                        className="mr-2"
                                                        name="universityFilter"
                                                        value={uni}
                                                        checked={universityFilter === uni}
                                                        onChange={() => setUniversityFilter(uni)}
                                                    />
                                                    {uni}
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
                {(statusFilter.overall !== "all" || statusFilter.industry !== "all" || statusFilter.teacher !== "all" || universityFilter !== "all") && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {statusFilter.overall !== "all" && (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${theme === "dark" ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-600"}`}>
                                <span>Overall: {statusFilter.overall}</span>
                                <button onClick={() => setStatusFilter({ ...statusFilter, overall: "all" })} className="focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {statusFilter.industry !== "all" && (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${theme === "dark" ? "bg-brand-900/30 text-brand-300" : "bg-brand-100 text-brand-600"}`}>
                                <span>Industry: {statusFilter.industry}</span>
                                <button onClick={() => setStatusFilter({ ...statusFilter, industry: "all" })} className="focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {statusFilter.teacher !== "all" && (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${theme === "dark" ? "bg-brand-900/30 text-brand-300" : "bg-brand-100 text-brand-600"}`}>
                                <span>Teacher: {statusFilter.teacher}</span>
                                <button onClick={() => setStatusFilter({ ...statusFilter, teacher: "all" })} className="focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {universityFilter !== "all" && (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                                <School className="w-4 h-4" />
                                <span>{universityFilter}</span>
                                <button onClick={() => setUniversityFilter("all")} className="focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Content */}
                <div className="mb-6">
                    <div className="relative flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-xl ${theme === "dark" ? "bg-brand-900/30 text-brand-400" : "bg-brand-100 text-brand-600"}`}>
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-semibold">Evaluation Groups</h2>

                        {isDurationExceeded(projectData.duration?.endDate) && (
                            <span className={`text-xs px-2 py-1 rounded-full -translate-y-1/2 ${theme === "dark" ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"}`}>
                                End Date Exceeded
                            </span>
                        )}
                    </div>

                    {filteredGroups.length === 0 ? (
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
                                            <th className="px-6 py-4 text-left font-medium">University</th>
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
                                                            <School className="w-4 h-4 opacity-70" />
                                                            <span>{selection.university}</span>
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
                                                            onClick={() => navigate(`/evaluating/${projectId}/${selection.selectionId}`)}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${theme === "dark" ?
                                                                "bg-brand-900/30 hover:bg-brand-900/50 text-brand-300 hover:text-white" :
                                                                "bg-brand-100 hover:bg-brand-200 text-brand-600 hover:text-brand-700"} shadow-sm`}
                                                        >
                                                            {selection.status.isCompleted ? "View Results" : "Evaluate"}
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
                    )}
                </div>
            </div>

            {/* Approve Extension Modal */}
            {showApproveModal && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme === "dark" ? "bg-black/70" : "bg-black/50"}`}>
                    <div className={`w-full max-w-md rounded-xl p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                        <h3 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                            Approve Extension Request
                        </h3>

                        <div className="mb-4">
                            <p className={`mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                The student requested an extension until:
                            </p>
                            <p className={`font-medium ${theme === "dark" ? "text-brand-300" : "text-brand-600"}`}>
                                {new Date(extensionRequest.date).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className={`flex items-center mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                <input
                                    type="checkbox"
                                    checked={useCustomDate}
                                    onChange={(e) => setUseCustomDate(e.target.checked)}
                                    className="mr-2"
                                    disabled={isApproving} // Disable checkbox during approval
                                />
                                Set a different end date
                            </label>

                            {useCustomDate && (
                                <div className="mt-2">
                                    <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                        New End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-3 py-2 rounded-md border ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"} ${isApproving ? "opacity-70 cursor-not-allowed" : ""}`}
                                        disabled={isApproving} // Disable input during approval
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    if (!isApproving) {
                                        setShowApproveModal(false);
                                        setCustomEndDate("");
                                        setUseCustomDate(false);
                                    }
                                }}
                                disabled={isApproving}
                                className={`px-4 py-2 rounded-md flex items-center justify-center ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-800"} ${isApproving ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApproveExtension}
                                disabled={isApproving || (useCustomDate && !customEndDate)}
                                className={`px-4 py-2 rounded-md flex items-center justify-center ${isApproving ?
                                    (theme === "dark" ? "bg-green-800/50 text-green-200/50" : "bg-green-100 text-green-400") :
                                    (useCustomDate && !customEndDate) ?
                                        (theme === "dark" ? "bg-green-800/50 text-green-200/50 cursor-not-allowed" : "bg-green-100 text-green-400 cursor-not-allowed") :
                                        (theme === "dark" ? "bg-green-700 hover:bg-green-600 text-white" : "bg-green-600 hover:bg-green-700 text-white")
                                    }`}
                            >
                                {isApproving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : "Approve Extension"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

AllGroups.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default AllGroups;
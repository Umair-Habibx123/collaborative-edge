import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../auth/AuthContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import { XCircle, PlusCircle, Trash2, Lock, Clock, ArrowLeft, LogIn, FileText, X, CheckCircle, Folder, BarChart2, ChevronDown, ChevronRight, Download, Plus, FolderOpen, Calendar, User, MessageSquare, AlertCircle } from 'lucide-react';
import Loading from '../../../../Components/loadingIndicator/loading';
import UploadFiles from '../SubmitDeliverables/Modal/UploadFiles';


const ViewSubmissions = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(null);
    const [project, setProject] = useState(null);
    const [selectionDetails, setSelectionDetails] = useState(null);
    const [invalidProjectSearch, setInvalidProjectSearch] = useState(false);
    const { user, isAuthLoading } = useAuth();
    const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [isCheckingUser, setIsCheckingUser] = useState(true);
    const [submissions, setSubmissions] = useState([]);
    const [expandedSubmissions, setExpandedSubmissions] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const navigate = useNavigate();


    // Apply theme class to the body element
    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setIsCheckingUser(true);

            try {
                // 1. Fetch project details
                const projectRes = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchProjectDetailById/${id}`);
                const projectData = await projectRes.json();

                if (projectData.message === "Project not found") {
                    setProject(null);
                    setInvalidProjectSearch(true);
                    return; // Early return if project not found
                } else {
                    setProject(projectData);
                }

                // 2. Check user in project (only if user exists)
                if (user && user.email) {
                    const userCheckRes = await fetch(
                        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/CheckUserInProject?projectId=${id}&userEmail=${user.email}`
                    );
                    const userCheckData = await userCheckRes.json();

                    if (userCheckData.message !== "User is in the project") {
                        setInvalidProjectSearch(true);
                        return; // Early return if user not in project
                    } else {
                        setInvalidProjectSearch(false);
                    }
                }

                // 3. Fetch selection details (only if user exists and project is valid)
                if (user && user.email && !invalidProjectSearch) {
                    const selectionRes = await fetch(
                        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchselectionDetails/${id}/${user.email}`
                    );

                    if (selectionRes.ok) {
                        const selectionData = await selectionRes.json();
                        setSelectionDetails(selectionData.studentSelection[0]);

                        // 4. Fetch submissions (only if selection details exist)
                        if (selectionData.studentSelection[0]?.selectionId) {
                            const submissionsRes = await fetch(
                                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchSubmissionsBySelectionId/${selectionData.studentSelection[0].selectionId}`
                            );

                            if (submissionsRes.ok) {
                                const submissionsData = await submissionsRes.json();
                                setSubmissions(submissionsData);

                                // Initialize expanded state
                                const expandedState = {};
                                submissionsData.submissions.forEach((sub, index) => {
                                    expandedState[sub.submissionId] = index === 0;
                                });
                                setExpandedSubmissions(expandedState);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
                setIsCheckingUser(false);
            }
        };

        fetchAllData();
    }, [id, user, refreshKey, invalidProjectSearch]); // Keep all dependencies



    const handleSubmit = async (files, comment) => {
        setIsSubmitting(true); // Start loading
        try {
            // Step 1: Upload files
            const uploadedFiles = await Promise.all(
                files.map(async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);

                    const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/uploadFile`, {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error("File upload failed");
                    }

                    return response.json();
                })
            );

            // Step 2: Prepare submission data
            const submissionData = {
                projectId: id,
                selectionId: selectionDetails.selectionId,
                submittedById: user.email,
                submittedByName: user.username,
                comments: comment,
                files: uploadedFiles.map((fileData) => ({
                    fileName: fileData.fileName,
                    fileUrl: fileData.fileUrl,
                    uploadedAt: new Date().toISOString(),
                })),
            };

            // Step 3: Send submission data to backend
            const submissionResponse = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/addSubmission`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submissionData),
            });

            if (!submissionResponse.ok) {
                throw new Error("Submission failed");
            }

            const result = await submissionResponse.json();
            toast.success("Submission successful!");

            // Refresh the data
            setRefreshKey(prev => prev + 1);
            setIsModalOpen(false);
        } catch (error) {
            toast.error(`Submission failed: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSubmission = async (submissionId, files) => {
        if (!window.confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/deleteSubmission`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    submissionId,
                    selectionId: selectionDetails.selectionId,
                    files
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete submission");
            }

            toast.success("Submission deleted successfully!");
            setRefreshKey(prev => prev + 1); // Refresh the list
        } catch (error) {
            toast.error(`Error deleting submission: ${error.message}`);
        }
    };



    const toggleSubmission = (submissionId) => {
        setExpandedSubmissions(prev => ({
            ...prev,
            [submissionId]: !prev[submissionId]
        }));
    };


    function formatDate(dateString) {
        try {
            const dateObj = new Date(dateString); // Directly parse the string
            return format(dateObj, 'MMM d, yyyy h:mm a');
        } catch (e) {
            return `Invalid date: ${e.message}`; // Use template literals to include error details
        }
    }

    const handleSubmitClick = () => {
        if (selectionDetails?.status?.isCompleted) {
            setIsCompletedModalOpen(true);
        } else {
            setIsModalOpen(true);
        }
    };


    const isProjectExpired = (endDate) => {
        if (!endDate) return false;
        const today = new Date();
        const projectEndDate = new Date(endDate);
        return today > projectEndDate;
    };



    if (loading || isAuthLoading || isCheckingUser || !user) {
        return <Loading />;
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

    if (!project || invalidProjectSearch || user.role !== "student") {
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
        <div className={`relative -mt-[70px] md:-mt-[90px] min-h-screen p-4 md:p-8 transition-colors duration-300 ${theme === "dark" ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
            <ToastContainer />

            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>

                    <h2 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-brand-500 via-brand-500 to-pink-500 bg-clip-text text-transparent">
                        Project Submissions
                    </h2>

                    <div className="w-full sm:w-auto"> {/* Spacer for alignment */}
                    </div>
                </div>

                {/* Summary Card */}
                <div className={`rounded-2xl p-6 shadow-xl bg-gradient-to-r from-brand-600 to-brand-700 ${theme === "dark" ? "shadow-brand-900/20" : "shadow-brand-500/20"}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <BarChart2 className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">Submission Analytics</h2>
                            </div>
                            <p className="text-brand-100 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span>{submissions.totalSubmissions || 0} submissions</span>
                                <span className="mx-1">•</span>
                                <Calendar className="w-4 h-4" />
                                <span>Last updated: {submissions.lastSubmittedAt ? formatDate(submissions.lastSubmittedAt) : 'N/A'}</span>
                            </p>
                        </div>

                        <button
                            className={`w-full sm:w-auto px-6 py-3 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2 ${isProjectExpired(project.duration.endDate)
                                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                : " bg-white/90 hover:bg-white text-brand-700 hover:text-brand-800 shadow-md cursor-pointer"
                                }`}
                            onClick={!isProjectExpired(project.duration.endDate) ? handleSubmitClick : undefined}
                            disabled={isProjectExpired(project.duration.endDate)}
                        >
                            {isProjectExpired(project.duration.endDate) ? (
                                <>
                                    <XCircle className="w-5 h-5" />
                                    <span>Submission Closed</span>
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="w-5 h-5" />
                                    <span>New Submission</span>
                                </>
                            )}
                        </button>

                    </div>
                </div>

                {isProjectExpired(project.duration.endDate) && (
                    <div className={`m-4 p-4 rounded-lg text-center ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-800"}`}>
                        <p className="font-semibold">This project has expired and can no longer take actions.</p>
                        <p>The end date was {new Date(project.duration.endDate).toLocaleDateString()}.</p>
                    </div>
                )}


                {/* Project Status Alert */}
                <div className="space-y-4">
                    {isProjectExpired(project.duration.endDate) && !selectionDetails?.status?.isCompleted && (
                        <div className={`p-4 rounded-lg flex items-center ${theme === "dark" ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800"}`}>
                            <AlertCircle className="w-6 h-6 mr-3" />
                            <div>
                                <h3 className="font-bold">Project Deadline Passed</h3>
                                <p>The project end date has passed. Please contact your supervisor for further instructions.</p>
                            </div>
                        </div>
                    )}

                    {selectionDetails?.status?.isCompleted ? (
                        <div className={`p-4 sm:p-5 md:p-6 rounded-2xl shadow-md flex items-start gap-4 ${theme === "dark" ? "bg-green-900 text-green-100" : "bg-green-100 text-green-900"}`}>
                            <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-green-500 mt-1 shrink-0" />
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold">Project Completed</h3>
                                <p className="text-sm sm:text-base">This project has been marked as completed. No more submissions can be made.</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme === 'dark'
                                            ? selectionDetails.status.IndustryCompleted
                                                ? 'bg-brand-800 text-brand-200'
                                                : 'bg-gray-700 text-gray-300'
                                            : selectionDetails.status.IndustryCompleted
                                                ? 'bg-brand-100 text-brand-800'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {selectionDetails.status.IndustryCompleted ? 'Industry ✓' : 'Industry Pending'}
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme === 'dark'
                                            ? selectionDetails.status.TeacherCompleted
                                                ? 'bg-brand-800 text-brand-200'
                                                : 'bg-gray-700 text-gray-300'
                                            : selectionDetails.status.TeacherCompleted
                                                ? 'bg-brand-100 text-brand-800'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {selectionDetails.status.TeacherCompleted ? 'Teacher ✓' : 'Teacher Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : !isProjectExpired(project.duration.endDate) && (
                        <div className={`p-4 sm:p-5 md:p-6 rounded-2xl shadow-md flex items-start gap-4 ${theme === "dark" ? "bg-yellow-900 text-yellow-100" : "bg-yellow-100 text-yellow-900"}`}>
                            <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 mt-1 shrink-0" />
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold">Project Pending</h3>
                                <p className="text-sm sm:text-base">This project is still in progress. You can continue making submissions.</p>
                                {selectionDetails?.status && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme === 'dark'
                                                ? selectionDetails.status.IndustryCompleted
                                                    ? 'bg-brand-800 text-brand-200'
                                                    : 'bg-gray-700 text-gray-300'
                                                : selectionDetails.status.IndustryCompleted
                                                    ? 'bg-brand-100 text-brand-800'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {selectionDetails.status.IndustryCompleted ? 'Industry ✓' : 'Industry Pending'}
                                        </span>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme === 'dark'
                                                ? selectionDetails.status.TeacherCompleted
                                                    ? 'bg-brand-800 text-brand-200'
                                                    : 'bg-gray-700 text-gray-300'
                                                : selectionDetails.status.TeacherCompleted
                                                    ? 'bg-brand-100 text-brand-800'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {selectionDetails.status.TeacherCompleted ? 'Teacher ✓' : 'Teacher Pending'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>




                {/* Main Content */}
                <div className={`rounded-2xl overflow-hidden shadow-xl ${theme === "dark" ? "bg-gray-900/80 border border-gray-800" : "bg-white border border-gray-100"}`}>
                    {/* Panel Header */}
                    <div className={`p-6 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-100"} flex items-center gap-3`}>
                        <FolderOpen className="w-6 h-6 text-brand-500" />
                        <h3 className="text-xl font-semibold">All Submissions</h3>
                        <span className={`ml-auto px-3 py-1 rounded-full text-sm ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                            {submissions.submissions?.length || 0} items
                        </span>
                    </div>

                    {/* Submissions List */}
                    {submissions.submissions && submissions.submissions.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                            {submissions.submissions.map((submission) => (
                                <div key={submission.submissionId} className="group">
                                    <div
                                        className={`p-5 transition-colors duration-200 ${theme === "dark" ? "hover:bg-gray-800/70" : "hover:bg-gray-50"} cursor-pointer`}
                                        onClick={() => toggleSubmission(submission.submissionId)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-brand-50"}`}>
                                                {expandedSubmissions[submission.submissionId] ? (
                                                    <ChevronDown className="w-5 h-5 text-brand-500" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-brand-500" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                    <h4 className="font-medium truncate">
                                                        Submission #{submission.submissionId.split('_')[1]}
                                                    </h4>
                                                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${theme === "dark" ? "bg-gray-800 text-brand-300" : "bg-brand-100 text-brand-600"}`}>
                                                        {submission.files.length} file{submission.files.length !== 1 ? 's' : ''}
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                                    <div className={`flex items-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                                        <User className="w-4 h-4 mr-1.5" />
                                                        <span>{submission.submittedByName}</span>
                                                    </div>
                                                    <div className={`flex items-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                                        <Calendar className="w-4 h-4 mr-1.5" />
                                                        <span>{formatDate(submission.submittedAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {expandedSubmissions[submission.submissionId] && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`px-5 pb-5 ${theme === "dark" ? "bg-gray-900/50" : "bg-gray-50"}`}
                                        >
                                            <div className="ml-12 pl-4 space-y-5">
                                                {/* Comments Section */}
                                                {submission.comments && (
                                                    <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                                                        <div className="flex gap-3">
                                                            <MessageSquare className="flex-shrink-0 mt-0.5 text-brand-500" size={18} />
                                                            <div>
                                                                <p className="font-medium mb-1.5">Comments</p>
                                                                <p className="text-sm">{submission.comments}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Files Section */}
                                                <div className="space-y-3">
                                                    <h5 className="font-medium flex items-center gap-2">
                                                        <Folder className="w-5 h-5 text-brand-500" />
                                                        Submitted Files
                                                    </h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {submission.files.map((file) => (
                                                            <div
                                                                key={`${file._id?.$oid || file.fileName}-${file.uploadedAt?.$date || Date.now()}`}
                                                                className={`p-3 rounded-lg border ${theme === "dark" ? "border-gray-800 bg-gray-800 hover:bg-gray-700" : "border-gray-200 bg-white hover:bg-gray-50"} transition-colors shadow-sm`}
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="flex items-center min-w-0">
                                                                        <FileText className="flex-shrink-0 mr-2 text-brand-500" size={18} />
                                                                        <span className="truncate">{file.fileName}</span>
                                                                    </div>

                                                                    <a
                                                                        href={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${file.fileUrl}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="cursor-pointer p-1.5 rounded-full hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
                                                                        title="Download"
                                                                    >
                                                                        <Download size={16} />
                                                                    </a>

                                                                </div>
                                                                <div className="mt-2 text-xs flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span>Uploaded: {formatDate(file.uploadedAt)}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Inside the expanded content section, after the files section */}
                                                <div className="mt-4 flex justify-end">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSubmission(submission.submissionId, submission.files);
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors duration-200 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>Delete Submission</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                                <FolderOpen className="w-16 h-16 text-gray-400 mb-4" />
                                <h4 className="text-xl font-medium mb-3">No submissions found</h4>
                                <p className={`mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    This project doesn&apos;t have any submissions yet. Be the first to contribute!
                                </p>

                                <button
                                    className={`w-full sm:w-auto px-6 py-3 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2 ${isProjectExpired(project.duration.endDate)
                                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                        : "bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-brand-600 text-white shadow-md cursor-pointer"
                                        }`}
                                    onClick={!isProjectExpired(project.duration.endDate) ? handleSubmitClick : undefined}
                                    disabled={isProjectExpired(project.duration.endDate)}
                                >
                                    {isProjectExpired(project.duration.endDate) ? (
                                        <>
                                            <XCircle className="w-5 h-5" />
                                            <span>Submission Closed</span>
                                        </>
                                    ) : (
                                        <>
                                            <PlusCircle className="w-5 h-5" />
                                            <span>Create Submission</span>
                                        </>
                                    )}
                                </button>

                            </div>
                        </div>
                    )}
                </div>
            </div>

            <UploadFiles
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Files"
                theme={theme}
                name={user.username}
                email={user.email}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting} // Pass the loading state
            />
            {/* Completed Project Modal */}
            {isCompletedModalOpen && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme === "dark" ? "bg-black/40 backdrop-blur-sm" : "bg-gray-500/40 backdrop-blur-sm"}`}>
                    <div className={`relative w-full max-w-md rounded-2xl shadow-xl transition-all ${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => setIsCompletedModalOpen(false)}
                                className={`p-1 rounded-full ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                                <h2 className="text-2xl font-bold mb-2">Project Completed</h2>
                                <p className="mb-6">This project has been marked as completed. No more submissions can be made.</p>

                                <div className="w-full mb-6 p-4 rounded-lg bg-opacity-20 bg-green-500">
                                    <h3 className="text-xl font-bold mb-2">Project Details</h3>
                                    <p><strong>Title:</strong> {project.title}</p>
                                    <p><strong>Type:</strong> {project.projectType}</p>
                                    <p>
                                        <strong>Duration:</strong>{" "}
                                        {new Date(project.duration.startDate).toLocaleDateString()} - {" "}
                                        {new Date(project.duration.endDate).toLocaleDateString()}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setIsCompletedModalOpen(false)}
                                    className={`px-6 py-3 rounded-lg ${theme === "dark" ? "bg-brand-600 hover:bg-brand-700" : "bg-brand-500 hover:bg-brand-600"} text-white transition-colors duration-300`}
                                >
                                    Understood
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ViewSubmissions;
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../../../../auth/AuthContext";
import {
    DownloadCloud,
    User,
    FolderOpen,
    RotateCw,
    FolderGit,
    Star,
    ChevronDown,
    ChevronUp,
    Users2,
    ChevronLeft,
    File,
    Loader2,
    XCircle,
    FileSearch,
    AlertCircle,
    Clock,
    CheckCircle2,
    PenSquare,
    BadgeCheck,
    CalendarDays,
    History,
    MessageSquareMore,
    HardHat,
    GraduationCap,
    Lock,
    ArrowLeft,
    CheckCircle,
} from "lucide-react";
import EvaluationModal from "./Modal/EvaluationModal";
import { toast, ToastContainer } from "react-toastify";
import Loading from "../../../../Components/loadingIndicator/loading";

const Evaluation = () => {
    const { projectId, selectionId } = useParams();
    const [submissions, setSubmissions] = useState({ submissions: [] });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [theme] = useState(localStorage.getItem("theme") || "light");
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [expandedSubmissions, setExpandedSubmissions] = useState([]);
    const [hoveredSubmission, setHoveredSubmission] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isMarkingComplete, setIsMarkingComplete] = useState(false);
    const [completionStatus, setCompletionStatus] = useState({
        status: {
            IndustryCompleted: false,
            TeacherCompleted: false,
            isCompleted: false
        },
        completedAt: null
    });
    const [noSubmissionsFound, setNoSubmissionsFound] = useState(false);
    const [projectData, setProjectData] = useState(null);



    useEffect(() => {
        fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchProjectDetailById/${projectId}`)
            .then((res) => res.json())
            .then((data) => setProjectData(data))
            .catch((err) => console.error("Error fetching project details:", err));
    }, [projectId]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setNoSubmissionsFound(false);
                setError(null);

                // Fetch submissions
                const submissionsResponse = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getSubmissions`, {
                    params: { projectId, selectionId }
                });

                if (submissionsResponse.data.message === "No submissions found") {
                    setNoSubmissionsFound(true);
                    setSubmissions({ submissions: [] });
                } else {
                    setSubmissions(submissionsResponse.data || { submissions: [] });
                }

                // Fetch completion status
                const completionResponse = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getCompletionStatus/${projectId}/${selectionId}`
                );
                setCompletionStatus(completionResponse.data);

                // Fetch reviews
                const reviewResponse = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getReviewForSelection/${projectId}/${selectionId}`);
                if (reviewResponse.data && reviewResponse.data.reviews && reviewResponse.data.reviews.length > 0) {
                    setReviews(reviewResponse.data.reviews);
                } else {
                    setReviews([]);
                }
            } catch (err) {
                if (err.response?.data?.message === "No submissions found") {
                    setNoSubmissionsFound(true);
                    setSubmissions({ submissions: [] });
                } else {
                    setError(err.response?.data?.message || "Failed to fetch data");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId, selectionId]);

    const toggleSubmission = (submissionId) => {
        setExpandedSubmissions(prev =>
            prev.includes(submissionId)
                ? prev.filter(id => id !== submissionId)
                : [...prev, submissionId]
        );
    };

    const handleMarkAsCompleted = async (markAsComplete) => {
        try {
            setIsMarkingComplete(true);
            const value = markAsComplete;
            await axios.put(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/MarkAsCompleted/${projectId}/${selectionId}/${user.role}/${value}`
            );
            toast.success(`Project marked as ${markAsComplete ? 'completed' : 'incomplete'} successfully!`);

            setCompletionStatus(prev => ({
                ...prev,
                status: {
                    ...prev.status,
                    [user.role === "teacher" ? "TeacherCompleted" : "IndustryCompleted"]: markAsComplete,
                    isCompleted: markAsComplete
                },
                completedAt: markAsComplete ? new Date().toISOString() : null
            }));

        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to mark project as ${markAsComplete ? 'completed' : 'incomplete'}`);
        } finally {
            setIsMarkingComplete(false);
        }
    };

    const handleEvaluateAll = () => {
        if (submissions.submissions.length > 0) {
            setSelectedSubmission(submissions.submissions[submissions.submissions.length - 1]);
            setShowModal(true);
        }
    };

    const handleEvaluate = (submission) => {
        setSelectedSubmission(submission);
        setShowModal(true);
    };

    const handleReviewSubmit = async (newReviewData) => {
        try {
            // Fetch updated reviews after submission
            const reviewResponse = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getReviewForSelection/${projectId}/${selectionId}`);
            if (reviewResponse.data && reviewResponse.data.reviews) {
                setReviews(reviewResponse.data.reviews);
            }
            toast.success("Review submitted successfully!");
        } catch (err) {
            toast.error(`Failed to refresh review data: ${err}`);
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const getUserReview = (role) => {
        return reviews.find(review => review.reviewerId === user.email && review.reviewerRole === role);
    };

    const hasTeacherReview = reviews.some(review => review.reviewerRole === "teacher");
    const hasIndustryReview = reviews.some(review => review.reviewerRole === "industry");
    const userTeacherReview = getUserReview("teacher");
    const userIndustryReview = getUserReview("industry");

    if (!projectData) {
        return <Loading />;
    }

    if (loading || !user) {
        return (
            <div className={`-mt-[70px] md:-mt-[90px] flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin">
                        <Loader2 className={`h-12 w-12 ${theme === 'dark' ? 'text-brand-500' : 'text-brand-600'}`} />
                    </div>
                    <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading submissions...</p>
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

    if (noSubmissionsFound || !submissions?.submissions || submissions.submissions.length === 0) {
        return (
            <div className={`-mt-[70px] md:-mt-[90px] min-h-screen p-4 md:p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <ToastContainer />
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                            <div className="space-y-3">
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
                                    Project Submissions
                                </h1>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                                        <FolderGit className="h-4 w-4 mr-2 text-brand-500" />
                                        Project: <span className="ml-1 font-mono">{projectId}</span>
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                                        <Users2 className="h-4 w-4 mr-2 text-brand-500" />
                                        Group: <span className="ml-1 font-mono">{selectionId}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* No Submissions Found UI */}
                    <div className={`rounded-xl overflow-hidden transition-all ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg border border-gray-200'}`}>
                        <div className="p-8 text-center">
                            <div className={`inline-flex items-center justify-center p-4 rounded-full mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <FileSearch className="h-12 w-12 text-gray-500" />
                            </div>
                            <h3 className={`text-2xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                No Submissions Found
                            </h3>
                            <p className={`mb-6 max-w-md mx-auto text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                This group hasn&apos;t submitted any work for this project yet.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2
                                            ${theme === 'dark'
                                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                                >
                                    <RotateCw className="h-5 w-5" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`-mt-[70px] md:-mt-[90px] min-h-screen p-4 md:p-8 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            <ToastContainer />
            <div className="max-w-6xl mx-auto">

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handleBackClick}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${theme === "dark" ? "hover:bg-gray-800/50 text-brand-400" : "hover:bg-gray-100 text-brand-600"}`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-medium">Back</span>
                        </button>
                    </div>
                </div>

                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col gap-6 mb-8">
                        {/* Header section */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
                                    Project Submissions
                                </h1>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                                        <FolderGit className="h-4 w-4 mr-2 text-brand-500" />
                                        Project: <span className="ml-1 font-mono">{projectId}</span>
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                                        <Users2 className="h-4 w-4 mr-2 text-brand-500" />
                                        Group: <span className="ml-1 font-mono">{selectionId}</span>
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                                        <Clock className="h-4 w-4 mr-2 text-amber-500" />
                                        Last: <span className="ml-1">{new Date(submissions.lastSubmittedAt).toLocaleDateString()}</span>
                                    </span>
                                </div>
                            </div>


                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme === 'dark'
                                        ? completionStatus.status.IndustryCompleted
                                            ? 'bg-brand-800 text-brand-200'
                                            : 'bg-gray-700 text-gray-300'
                                        : completionStatus.status.IndustryCompleted
                                            ? 'bg-brand-100 text-brand-800'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    {completionStatus.status.IndustryCompleted ? 'Industry ✓' : 'Industry Pending !?'}
                                </span>
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme === 'dark'
                                        ? completionStatus.status.TeacherCompleted
                                            ? 'bg-brand-800 text-brand-200'
                                            : 'bg-gray-700 text-gray-300'
                                        : completionStatus.status.TeacherCompleted
                                            ? 'bg-brand-100 text-brand-800'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    {completionStatus.status.TeacherCompleted ? 'Teacher ✓' : 'Teacher Pending !?'}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons - now in a single row with consistent spacing */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <div className="flex flex-1 gap-3">
                                {user.role === "industry" && (
                                    <button
                                        onClick={handleEvaluateAll}
                                        className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all hover:shadow-lg gap-2
                                          ${theme === 'dark'
                                                ? 'bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-500 hover:to-brand-500 text-white shadow-lg'
                                                : 'bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-400 hover:to-brand-400 text-white shadow-md'
                                            }`}
                                    >
                                        {userIndustryReview ? (
                                            <>
                                                <PenSquare className="h-5 w-5" />
                                                <span className="whitespace-nowrap">Edit Industry Review</span>
                                            </>
                                        ) : (
                                            <>
                                                <GraduationCap className="h-5 w-5" />
                                                <span className="whitespace-nowrap">Add Industry Review</span>
                                            </>
                                        )}
                                    </button>
                                )}

                                {user.role === "teacher" && (
                                    <button
                                        onClick={handleEvaluateAll}
                                        className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all hover:shadow-lg gap-2
                  ${theme === 'dark'
                                                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg'
                                                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md'
                                            }`}
                                    >
                                        {userIndustryReview ? (
                                            <>
                                                <PenSquare className="h-5 w-5" />
                                                <span className="whitespace-nowrap">Edit Industry Review</span>
                                            </>
                                        ) : (
                                            <>
                                                <HardHat className="h-5 w-5" />
                                                <span className="whitespace-nowrap">Add Industry Review</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="flex-1">
                                {completionStatus.status.IndustryCompleted ? (
                                    <button
                                        onClick={() => handleMarkAsCompleted(false)}
                                        disabled={isMarkingComplete || completionStatus.status.isCompleted === true}
                                        className={`w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all gap-2
    ${theme === 'dark'
                                                ? 'text-white shadow-lg'
                                                : 'text-white shadow-md'}
    ${isMarkingComplete || completionStatus.status.isCompleted
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : theme === 'dark'
                                                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 hover:shadow-lg'
                                                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 hover:shadow-md'
                                            }`}
                                    >
                                        {isMarkingComplete ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <XCircle className="h-5 w-5" />
                                        )}
                                        <span className="whitespace-nowrap">Mark as Incomplete</span>
                                    </button>

                                ) : (
                                    <button
                                        onClick={() => handleMarkAsCompleted(true)}
                                        disabled={isMarkingComplete}
                                        className={`w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all hover:shadow-lg gap-2
                  ${theme === 'dark'
                                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg'
                                                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-md'
                                            }`}
                                    >
                                        {isMarkingComplete ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="h-5 w-5" />
                                        )}
                                        <span className="whitespace-nowrap">Mark as Complete</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Reviews Section */}
                    {(hasTeacherReview || hasIndustryReview) && (
                        <div className={`mb-6 rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold flex items-center">
                                    <BadgeCheck className="h-5 w-5 mr-3 text-green-500" />
                                    Project Reviews
                                </h3>
                            </div>

                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {/* Teacher Reviews */}
                                {hasTeacherReview && (
                                    <div className="p-5">
                                        <div className="flex items-center mb-4">
                                            <GraduationCap className="h-6 w-6 mr-3 text-brand-500" />
                                            <h4 className="text-lg font-semibold">Teacher Reviews</h4>
                                        </div>
                                        <div className="space-y-4 pl-9">
                                            {reviews
                                                .filter(review => review.reviewerRole === "teacher")
                                                .map((review, index) => (
                                                    <div key={index} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h5 className="font-medium">{review.fullName}</h5>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {new Date(review.reviewedAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Star className="h-5 w-5 text-amber-500 mr-1" />
                                                                <span className="font-bold">{review.rating * 20}/100</span>
                                                            </div>
                                                        </div>
                                                        <p className="mt-2">{review.comments}</p>
                                                        {review.reviewerId === user.email && (
                                                            <button
                                                                onClick={handleEvaluateAll}
                                                                className={`mt-3 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                                                                        ${theme === 'dark'
                                                                        ? 'bg-brand-900/50 hover:bg-brand-800 text-brand-300'
                                                                        : 'bg-brand-100 hover:bg-brand-200 text-brand-600'
                                                                    }`}
                                                            >
                                                                <PenSquare className="h-4 w-4" />
                                                                Edit Review
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Industry Reviews */}
                                {hasIndustryReview && (
                                    <div className="p-5">
                                        <div className="flex items-center mb-4">
                                            <HardHat className="h-6 w-6 mr-3 text-amber-500" />
                                            <h4 className="text-lg font-semibold">Industry Reviews</h4>
                                        </div>
                                        <div className="space-y-4 pl-9">
                                            {reviews
                                                .filter(review => review.reviewerRole === "industry")
                                                .map((review, index) => (
                                                    <div key={index} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h5 className="font-medium">{review.fullName}</h5>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {new Date(review.reviewedAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Star className="h-5 w-5 text-amber-500 mr-1" />
                                                                <span className="font-bold">{review.rating * 20}/100</span>
                                                            </div>
                                                        </div>
                                                        <p className="mt-2">{review.comments}</p>
                                                        {review.reviewerId === user.email && (
                                                            <button
                                                                onClick={handleEvaluateAll}
                                                                className={`mt-3 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                                                                        ${theme === 'dark'
                                                                        ? 'bg-amber-900/50 hover:bg-amber-800 text-amber-300'
                                                                        : 'bg-amber-100 hover:bg-amber-200 text-amber-600'
                                                                    }`}
                                                            >
                                                                <PenSquare className="h-4 w-4" />
                                                                Edit Review
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Submission Timeline */}
                <div className={`rounded-xl overflow-hidden transition-all ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg border border-gray-200'}`}>
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center text-xl font-semibold">
                                <History className="h-5 w-5 mr-3 text-brand-500" />
                                Submission Timeline
                            </h2>
                            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                <span className="font-bold">{submissions.totalSubmissions}</span> submission{submissions.totalSubmissions !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {submissions.submissions.map((submission, index) => (
                            <div
                                key={submission.submissionId}
                                className={`transition-all duration-200 ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}
                                onMouseEnter={() => setHoveredSubmission(submission.submissionId)}
                                onMouseLeave={() => setHoveredSubmission(null)}
                            >
                                <div
                                    className={`flex items-center justify-between p-5 cursor-pointer ${expandedSubmissions.includes(submission.submissionId) ?
                                        theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50' : ''}`}
                                    onClick={() => toggleSubmission(submission.submissionId)}
                                >
                                    <div className="flex items-center">
                                        <div className="relative mr-4">
                                            <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} ${hoveredSubmission === submission.submissionId ? 'ring-2 ring-offset-2 ring-brand-500' : ''}`}>
                                                <User className="h-6 w-6 text-gray-500" />
                                            </div>
                                            {index === 0 && (
                                                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">✓</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center">
                                                <h3 className="font-semibold text-lg mr-3">{submission.submittedByName}</h3>
                                                {index === 0 && (
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                                        Latest
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                                <CalendarDays className="h-4 w-4 mr-2" />
                                                {new Date(submission.submittedAt).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEvaluate(submission);
                                            }}
                                            className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2
                                                    ${theme === 'dark'
                                                    ? 'bg-brand-900/50 hover:bg-brand-800 text-brand-300 shadow'
                                                    : 'bg-brand-100 hover:bg-brand-200 text-brand-600 shadow-sm'
                                                }`}
                                        >
                                            {user.role === "teacher" ? (
                                                <GraduationCap className="h-4 w-4" />
                                            ) : (
                                                <HardHat className="h-4 w-4" />
                                            )}
                                            {user.role === "teacher" ? "Teacher Review" : "Industry Review"}
                                        </button>
                                        {expandedSubmissions.includes(submission.submissionId) ? (
                                            <ChevronUp className="h-5 w-5 text-gray-500 transition-transform" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform" />
                                        )}
                                    </div>
                                </div>

                                {expandedSubmissions.includes(submission.submissionId) && (
                                    <div className={`p-5 pt-0 transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800/20' : 'bg-gray-50'}`}>
                                        <div className="pl-16">
                                            {/* Comments Section */}
                                            {submission.comments && (
                                                <div className={`mb-5 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                                                    <div className="flex items-start">
                                                        <MessageSquareMore className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0 text-gray-500" />
                                                        <div>
                                                            <h4 className="font-medium text-gray-600 dark:text-gray-300 mb-1">Comments</h4>
                                                            <p className="text-sm">{submission.comments}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Files Section */}
                                            <div className="mb-1">
                                                <h4 className="font-medium mb-3 flex items-center text-gray-600 dark:text-gray-300">
                                                    <FolderOpen className="h-5 w-5 mr-3 text-gray-500" />
                                                    Submitted Files
                                                </h4>
                                                <div className="space-y-2 pl-1">
                                                    {submission.files?.map((file, index) => (
                                                        <div
                                                            key={index}
                                                            className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}`}
                                                        >
                                                            <div className="flex items-center min-w-0">
                                                                <File className="h-5 w-5 mr-3 flex-shrink-0 text-gray-500" />
                                                                <span className="truncate text-sm font-medium">{file.fileName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                    {new Date(file.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                <a
                                                                    href={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${file.fileUrl}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`p-2 rounded-lg transition-all ${theme === 'dark'
                                                                        ? 'text-brand-400 hover:bg-gray-700'
                                                                        : 'text-brand-600 hover:bg-gray-200'
                                                                        }`}
                                                                    title="Download"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <DownloadCloud className="h-5 w-5" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {
                showModal && selectedSubmission && (
                    <EvaluationModal
                        submissionId={selectedSubmission.submissionId}
                        projectId={projectId}
                        selectionId={selectionId}
                        onClose={() => setShowModal(false)}
                        onReviewSubmit={handleReviewSubmit}
                        theme={theme}
                        user={{
                            email: user.email,
                            username: user.username,
                            role: user.role
                        }}
                        existingReview={user.role === "teacher" ? userTeacherReview : userIndustryReview}
                    />
                )
            }
        </div >
    );
};

Evaluation.propTypes = {
    theme: PropTypes.string,
};

export default Evaluation;
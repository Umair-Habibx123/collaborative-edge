import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import {
    User, ChevronLeft, Star, StarHalf, MessageSquare, Clock,
    ClipboardList, Layers, BarChart2, Lock, ArrowLeft, Calendar,
    FileText, Users, Code, Award, CheckCircle, XCircle, AlertCircle,
    Bookmark, BookOpen, GitBranch, GraduationCap, Shield
} from "lucide-react";

const RatingsOrRemarks = () => {
    const { projectId, selectionId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [reviewData, setReviewData] = useState(null);
    const [projectDetails, setProjectDetails] = useState(null);
    const [selectionDetails, setSelectionDetails] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [invalidProjectSearch, setInvalidProjectSearch] = useState(false);
    const [isCheckingUser, setIsCheckingUser] = useState(true);
    const [project, setProject] = useState(null);

    // Apply theme class to the body element
    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            setIsCheckingUser(true);

            try {
                // 1. Fetch project details
                const projectRes = await fetch(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchProjectDetailById/${projectId}`
                );
                const projectData = await projectRes.json();

                if (projectData.message === "Project not found") {
                    setProject(null);
                    setProjectDetails(null);
                    setInvalidProjectSearch(true);
                    return;
                }

                setProject(projectData);
                setProjectDetails(projectData.project || projectData);

                // 2. Check user in project
                if (user?.email) {
                    const userCheckRes = await fetch(
                        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/CheckUserInProject?projectId=${projectId}&userEmail=${user.email}`
                    );
                    const userCheckData = await userCheckRes.json();

                    if (userCheckData.message !== "User is in the project") {
                        setInvalidProjectSearch(true);
                        return;
                    }
                    setInvalidProjectSearch(false);

                    // 3. Fetch selection details
                    const selectionRes = await fetch(
                        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchselectionDetails/${projectId}/${user.email}`
                    );
                    const selectionData = await selectionRes.json();
                    setSelectionDetails(selectionData);
                }

                // 4. Fetch review data
                if (selectionId) {
                    const reviewRes = await axios.get(
                        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getReviewForSelection/${projectId}/${selectionId}`
                    );
                    setReviewData(reviewRes.data);
                }
            } catch (err) {
                console.error("Error in fetch operations:", err);
            } finally {
                setIsLoading(false);
                setIsCheckingUser(false);
            }
        };

        fetchAllData();
    }, [projectId, user, selectionId]);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <Star
                        key={i}
                        className="w-5 h-5 fill-current text-yellow-400"
                        strokeWidth={1.5}
                    />
                );
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(
                    <StarHalf
                        key={i}
                        className="w-5 h-5 fill-current text-yellow-400"
                        strokeWidth={1.5}
                    />
                );
            } else {
                stars.push(
                    <Star
                        key={i}
                        className="w-5 h-5 text-gray-300 dark:text-gray-600"
                        strokeWidth={1.5}
                    />
                );
            }
        }

        return (
            <div className="flex items-center">
                {stars}
                <span className="ml-2 text-sm font-medium">
                    {rating.toFixed(1)}
                </span>
            </div>
        );
    };

    const renderStatusBadge = (status) => {
        if (status?.isCompleted) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                </span>
            );
        } else if (status?.IndustryCompleted || status?.TeacherCompleted) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Partially Completed
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <Clock className="w-3 h-3 mr-1" />
                    In Progress
                </span>
            );
        }
    };

    if (isLoading || isCheckingUser) {
        return <Loading />;
    }

    if (!project || invalidProjectSearch || user.role !== "student") {
        return (
            <div className={`-mt-[70px] md:-mt-[90px] min-h-screen flex items-center justify-center p-6 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
                <div className="bg-gradient-to-br from-gray-800 to-gray-700 dark:from-gray-900 dark:to-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl max-w-lg w-full text-center transition-all duration-300">
                    <div className="flex items-center justify-center mb-6">
                        <Lock className="w-16 h-16 text-red-400 animate-pulse" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
                        Access Restricted
                    </h2>
                    <p className="text-lg mb-6 opacity-90">You don't have permission to view this content.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 shadow-lg font-medium flex items-center justify-center mx-auto"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Return to Safety
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`-mt-[70px] md:-mt-[90px] min-h-screen p-4 md:p-6 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
            <div className="max-w-7xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors mb-6 ${theme === "dark" ? "text-brand-400 hover:bg-gray-800" : "text-brand-600 hover:bg-gray-100"} font-medium`}
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Dashboard
                </button>

                {/* Project header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white shadow-sm"}`}>
                                    <ClipboardList className="w-6 h-6 text-brand-500" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-brand-600">
                                        {projectDetails?.title}
                                    </h1>
                                    {selectionDetails?.studentSelection?.[0]?.status && (
                                        <div className="mt-1">
                                            {renderStatusBadge(selectionDetails.studentSelection[0].status)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className={`text-sm max-w-5xl py-4 px-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                {projectDetails?.description || "No description available"}
                            </p>
                        </div>

                        {projectDetails?.studentDetails && (
                            <div className={`flex items-center gap-3 p-3 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white shadow-sm"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                                {projectDetails.studentDetails.profilePic ? (
                                    <img
                                        src={projectDetails.studentDetails.profilePic}
                                        alt={projectDetails.studentDetails.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                                        <User className="w-5 h-5 text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium">{projectDetails.studentDetails.username}</p>
                                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                        Project Supervisor
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Project details cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-brand-50"}`}>
                                <Calendar className="w-5 h-5 text-brand-500" />
                            </div>
                            <div>
                                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Created</p>
                                <p className="font-medium">
                                    {new Date(projectDetails?.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-brand-50"}`}>
                                <FileText className="w-5 h-5 text-brand-500" />
                            </div>
                            <div>
                                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Status</p>
                                <p className="font-medium capitalize">
                                    {selectionDetails?.studentSelection?.[0]?.status?.isCompleted === true
                                        ? "Completed"
                                        : selectionDetails?.studentSelection?.[0]?.status?.isCompleted === false
                                            ? "Not Completed"
                                            : "Unknown"}
                                </p>

                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-green-50"}`}>
                                <Users className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Team Members</p>
                                <p className="font-medium">
                                    {selectionDetails?.studentSelection?.[0]?.groupMembers?.length || 3}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-amber-50"}`}>
                                <Code className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Project Type</p>
                                <p className="font-medium">
                                    {projectDetails?.projectType || "Not specified"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Members Section */}
                {selectionDetails?.studentSelection?.[0]?.groupMembers && (
                    <div className={`rounded-xl p-6 mb-8 ${theme === "dark" ? "bg-gray-800" : "bg-white shadow-sm"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <GraduationCap className="w-6 h-6 text-brand-500" />
                            <h3 className="text-lg font-semibold">Team Members</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectionDetails.studentSelection[0].groupMembers.map((member, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center gap-4 p-4 rounded-lg ${theme === "dark" ? "bg-gray-750 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"} transition-colors`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-white shadow-sm"}`}>
                                        {member.profilePic ? (
                                            <img
                                                src={member.profilePic}
                                                alt={member.username}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{member.username}</p>
                                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                            {member.email}
                                        </p>
                                        {selectionDetails.studentSelection[0].groupLeader === member.email && (
                                            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                                                Team Leader
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Project Timeline */}
                <div className={`rounded-xl p-6 mb-8 ${theme === "dark" ? "bg-gray-800" : "bg-white shadow-sm"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="w-6 h-6 text-brand-500" />
                        <h3 className="text-lg font-semibold">Project Timeline</h3>
                    </div>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className={`absolute left-4 top-0 h-full w-0.5 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>

                        {/* Timeline items */}
                        <div className="space-y-8">
                            {/* Start Date */}
                            <div className="relative pl-12">
                                <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-brand-900" : "bg-brand-100"}`}>
                                    <Bookmark className="w-4 h-4 text-brand-500" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Project Started</h4>
                                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                        {new Date(projectDetails?.duration?.startDate?.$date || projectDetails?.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Current Status */}
                            <div className="relative pl-12">
                                <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-brand-900" : "bg-brand-100"}`}>
                                    <GitBranch className="w-4 h-4 text-brand-500" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Current Status</h4>
                                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                        {selectionDetails?.studentSelection?.[0]?.status?.isCompleted ?
                                            "Project Completed" :
                                            selectionDetails?.studentSelection?.[0]?.status?.IndustryCompleted ||
                                                selectionDetails?.studentSelection?.[0]?.status?.TeacherCompleted ?
                                                "Partially Evaluated" : "In Progress"}
                                    </p>
                                </div>
                            </div>

                            {/* End Date */}
                            <div className="relative pl-12">
                                <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-green-900" : "bg-green-100"}`}>
                                    <Shield className="w-4 h-4 text-green-500" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Expected Completion</h4>
                                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                        {new Date(projectDetails?.duration?.endDate?.$date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {reviewData ? (
                    <div className="space-y-6">
                        {/* Feedback summary card */}
                        <div className={`rounded-xl p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white shadow-sm"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-brand-50"}`}>
                                            <Award className="w-5 h-5 text-brand-500" />
                                        </div>
                                        <h2 className="text-xl font-semibold">Project Evaluation</h2>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {renderStars(reviewData.averageRating)}
                                        <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                            ({reviewData.totalReviews} review{reviewData.totalReviews !== 1 ? 's' : ''})
                                        </span>
                                    </div>
                                </div>

                                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-brand-50"}`}>
                                    <MessageSquare className="w-5 h-5 text-brand-500" />
                                    <div>
                                        <span className="font-medium">Total Feedback:</span>
                                        <span className="ml-1">{reviewData.reviews.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Layers className="w-5 h-5 text-brand-500" />
                                <h3 className="text-lg font-semibold">Detailed Feedback</h3>
                            </div>

                            {reviewData.reviews.map((review, index) => (
                                <div
                                    key={index}
                                    className={`rounded-xl overflow-hidden transition-all hover:shadow-md ${theme === "dark" ? "bg-gray-800 hover:bg-gray-750" : "bg-white hover:bg-gray-50"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
                                >
                                    <div className="p-5 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                                                    <User className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{review.fullName}</p>
                                                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                                        {review.reviewerRole === 'teacher' ? 'Supervisor' : 'Representative'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                {renderStars(review.rating)}
                                                <div className={`flex items-center gap-1 mt-1 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                                    <Clock className="w-4 h-4" />
                                                    <span>{new Date(review.reviewedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`mt-4 p-4 rounded-lg ${theme === "dark" ? "bg-gray-700/50" : "bg-brand-50"} border ${theme === "dark" ? "border-gray-700" : "border-brand-100"}`}>
                                            <p className="whitespace-pre-line">{review.comments}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={`p-8 rounded-xl text-center ${theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-white shadow-sm text-gray-500"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-brand-50 text-brand-500 mb-4">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium">Awaiting Evaluations</h3>
                        <p className="mt-1 max-w-md mx-auto">This project hasn't received any feedback yet from the evaluation committee.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className={`mt-4 px-4 py-2 rounded-lg ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"} transition-colors`}
                        >
                            Check Back Later
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

RatingsOrRemarks.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default RatingsOrRemarks;
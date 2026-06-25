import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../../../../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import { motion, useScroll } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import { Lock, ArrowLeft, LogIn, XCircle, PlusCircle, Clock, User, CheckCircle, AlertCircle, X, Download } from "lucide-react"
import UploadFiles from "./Modal/UploadFiles.jsx";
import axios from "axios";

const SubmitDeliverables = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [selectionDetails, setSelectionDetails] = useState({});
    const [invalidProjectSearch, setInvalidProjectSearch] = useState(false);
    const { user, isAuthLoading } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [isCheckingUser, setIsCheckingUser] = useState(true);
    const [supervision, setSupervision] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
    const [hasPendingExtensionRequest, setHasPendingExtensionRequest] = useState(false);
    const [isSubmittingExtension, setIsSubmittingExtension] = useState(false);
    const [extensionData, setExtensionData] = useState({
        newEndDate: '',
        reason: ''
    });


    useEffect(() => {
        const checkPendingRequests = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/check-pending-extension/${project._id}/${user.email}`, {
                    headers: {}
                });
                setHasPendingExtensionRequest(response.data.hasPending);
            } catch (error) {
                console.error('Error checking extension requests:', error);
            }
        };

        if (project?._id && user?.email) {
            checkPendingRequests();
        }
    }, [project?._id, user?.email]);

    const handleOpenExtensionModal = () => {
        setIsExtensionModalOpen(true);
    };

    const handleSubmitExtensionRequest = async () => {
        if (!extensionData.newEndDate || !extensionData.reason) {
            alert('Please fill all fields');
            return;
        }

        setIsSubmittingExtension(true);
        try {
            await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/extension-request`, {
                projectId: project._id,
                studentId: user._id,
                newEndDate: extensionData.newEndDate,
                reason: extensionData.reason
            }, {
                headers: {}
            });

            setHasPendingExtensionRequest(true);
            setIsExtensionModalOpen(false);
            toast.success('Extension request submitted successfully');
        } catch (error) {
            console.error('Error submitting extension request:', error);
            toast.error(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setIsSubmittingExtension(false);
        }
    };

    const containerRef = useRef(null);
    const navigate = useNavigate();

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);


    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);

                const projectDetailRes = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchProjectDetailById/${id}`);
                const projectData = await projectDetailRes.json();

                if (projectData.message === "Project not found") {
                    setProject(null);
                    setInvalidProjectSearch(true);
                } else {
                    setProject(projectData);
                }

                if (user && user.email) {
                    const userCheckRes = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/CheckUserInProject?projectId=${id}&userEmail=${user.email}`);
                    const userCheckData = await userCheckRes.json();

                    if (userCheckData.message !== "User is in the project") {
                        setInvalidProjectSearch(true);
                    } else {
                        setInvalidProjectSearch(false);
                    }
                }

                await Promise.all([
                    fetchSupervision(),
                    fetchSelectionDetails()
                ]);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
                setIsCheckingUser(false);
            }
        };

        if (id && user) {
            fetchAllData();
        }
    }, [id, user]);


    const fetchSupervision = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchSupervisorDetails/${id}/${user.studentDetails.university}`,
            );

            if (response.data.success) {
                setSupervision(response.data.data);
                console.log(response.data.data);
            } else {
                console.error(response.data.message || "No data found");
            }
        } catch (err) {
            console.error(err.response?.data?.message || "Failed to fetch supervision details");
        } finally {
            setLoading(false);
        }
    };


    const fetchSelectionDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchselectionDetails/${id}/${user.email}`
            );

            if (response.ok) {
                const data = await response.json();
                setSelectionDetails(data.studentSelection[0]);
            } else {
                console.error("Failed to fetch selection details");
            }
        } catch (error) {
            console.error("Error fetching selection details:", error);
        } finally {
            setLoading(false);
        }
    };



    const handleSubmit = async (files, comment) => {
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
            toast.success("Submission successful:", result);

            setIsModalOpen(false);
        } catch (error) {
            toast.error("Error during submission:", error);
        }
    };

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


    if (isLoading || loading || isAuthLoading || isCheckingUser || !user || !selectionDetails) {
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
        <div className="relative -mt-[70px] md:-mt-[90px]">
            <ToastContainer />
            {/* Header Section - Fixed at Top */}
            <motion.div
                className={`border-2 sticky top-0 z-50 p-4 sm:p-8 w-full transition-all duration-300 drop-shadow-xl
${theme === "dark" ? "bg-gray-900 text-gray-100 border-gray-700" : "bg-white text-gray-900 border-gray-300"}`}
            >
                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-500 via-brand-500 to-pink-500 rounded-full"
                    style={{ scaleX: scrollYProgress }}
                />

                {/* Header Content */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    {/* Back Button */}
                    <div className="w-full sm:w-2/12 mb-6 sm:mb-0">
                        <button
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                        >
                            <ArrowLeft />
                            <span>Back</span>
                        </button>
                    </div>

                    {/* Project Title */}
                    <div className="w-full sm:w-8/12 text-center mb-6 sm:mb-0">
                        <h2 className={`text-3xl sm:text-4xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {project.title}
                        </h2>
                    </div>



                    <button
                        className={`w-full sm:w-auto px-6 py-3 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2 ${isProjectExpired(project.duration.endDate)
                            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                            : "bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 cursor-pointer"
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
                                <span>Submit...</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* {isProjectExpired(project.duration.endDate) && (
                <div className={`m-4 p-4 rounded-lg text-center ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-800"}`}>
                    <p className="font-semibold">This project has expired and can no longer take actions.</p>
                    <p>The end date was {new Date(project.duration.endDate).toLocaleDateString()}.</p>
                    {(!selectionDetails?.status?.isCompleted) && selectionDetails?.groupLeader?.email === user.email && (
                        <button
                            className={`m-2 px-4 py-2 rounded-md ${theme === "dark" ? "bg-brand-600 hover:bg-brand-700" : "bg-brand-500 hover:bg-brand-600"} text-white`}
                        >
                            Apply for Extend Date
                        </button>
                    )}
                </div>
            )} */}


            {isProjectExpired(project.duration.endDate) && (
                <div className={`m-4 p-4 rounded-lg text-center ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-800"}`}>
                    <p className="font-semibold">This project has expired and can no longer take actions.</p>
                    <p>The end date was {new Date(project.duration.endDate).toLocaleDateString()}.</p>
                    {(!selectionDetails?.status?.isCompleted) && selectionDetails?.groupLeader?.email === user.email && (
                        <>
                            {!hasPendingExtensionRequest && (
                                <button
                                    onClick={handleOpenExtensionModal}
                                    className={`m-2 px-4 py-2 rounded-md ${theme === "dark" ? "bg-brand-600 hover:bg-brand-700" : "bg-brand-500 hover:bg-brand-600"} text-white`}
                                >
                                    Apply for Date Extension
                                </button>
                            )}
                            {hasPendingExtensionRequest && (
                                <p className="text-yellow-500 font-medium">
                                    You have a pending extension request
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}




            {/* Content Section - Scrollable */}
            <motion.div
                ref={containerRef}
                className={`p-4 sm:p-8 w-full transition-all duration-300 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
                    }`}
            >
                <motion.div className="space-y-8">
                    {/* Project Status Alert */}
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


                    {/* Project Description */}
                    <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-700"} transition-colors duration-300`}>
                        {project.description}
                    </p>


                    {/* Supervision details section */}
                    {supervision && (
                        <div className={`${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"} p-6 rounded-xl shadow-lg transition-all duration-300`}>
                            <h2 className="text-2xl font-bold mb-4">Supervisor Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {supervision.supervisedBy.map((supervisor, index) => (
                                    <div
                                        key={index}
                                        className={`${theme === "dark" ? "bg-gray-700" : "bg-white"} p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg`}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${supervisor.responseFromInd.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
                                                    <User className="w-7 h-7" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold truncate">{supervisor.fullName}</h3>
                                                <p className="text-sm text-gray-500 truncate">Email: {supervisor.email}</p>
                                                <p className="text-sm text-gray-500">University: {supervisor.university}</p>

                                                <div className="mt-3">
                                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${supervisor.responseFromInd.status === 'approved'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        }`}>
                                                        {supervisor.responseFromInd.status.charAt(0).toUpperCase() + supervisor.responseFromInd.status.slice(1)}
                                                    </div>
                                                </div>

                                                {supervisor.responseFromInd.comments && supervisor.responseFromInd.comments !== "null" && (
                                                    <div className={`mt-3 p-3 bg-gray-100 ${theme === "dark" ? "bg-gray-600" : "bg-gray-100"} rounded-lg`}>
                                                        <p className="text-sm italic">{supervisor.responseFromInd.comments}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selection Details Section */}

                    {selectionDetails && (

                        < div className={`${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"} p-6 rounded-xl shadow-lg transition-all duration-300`}>
                            <h2 className="text-2xl font-bold mb-4">Selection Details</h2>
                            <div className="space-y-4">
                                <p><strong>Selection ID:</strong> {selectionDetails.selectionId}</p>
                                <p><strong>Joined At:</strong> {new Date(selectionDetails.joinedAt).toLocaleString()}</p>
                                <p><strong>Status:</strong> {selectionDetails.status.isCompleted ? "Completed" : "In Progress"}</p>

                                {/* Group Leader Section */}
                                {selectionDetails?.groupLeader && (
                                    <div className="mt-6">

                                        <h3 className="text-xl font-semibold mb-4">Group Leader</h3>
                                        <div className={`${theme === "dark" ? "bg-gray-700" : "bg-white"} p-4 rounded-lg shadow-md flex items-center space-x-4`}>
                                            {selectionDetails.groupLeader.profilePic ? (
                                                <img
                                                    src={selectionDetails.groupLeader.profilePic}
                                                    alt={selectionDetails.groupLeader.username}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-300">
                                                    <User className="w-6 h-6 text-gray-600" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold">{selectionDetails.groupLeader.username}</p>
                                                <p className="text-sm text-gray-500">{selectionDetails.groupLeader.email}</p>
                                                <p className="text-sm text-gray-500">Student ID: {selectionDetails.groupLeader.studentDetails.studentId}</p>
                                                <p className="text-sm text-gray-500">Degree: {selectionDetails.groupLeader.studentDetails.degreeOrProgram}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Group Members Section */}
                                <div className="mt-6">
                                    <h3 className="text-xl font-semibold mb-4">Group Members</h3>
                                    <div className="space-y-4">
                                        {selectionDetails?.groupMembers?.map((member, index) => (
                                            <div key={index} className={`${theme === "dark" ? "bg-gray-700" : "bg-white"} p-4 rounded-lg shadow-md flex items-center space-x-4`}>
                                                {member.profilePic ? (
                                                    <img
                                                        src={member.profilePic}
                                                        alt={member.username}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-300">
                                                        <User className="w-6 h-6 text-gray-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold">{member.username}</p>
                                                    <p className="text-sm text-gray-500">{member.email}</p>
                                                    <p className="text-sm text-gray-500">Student ID: {member.studentDetails.studentId}</p>
                                                    <p className="text-sm text-gray-500">Degree: {member.studentDetails.degreeOrProgram}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>


                    )}

                    {/* Project Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"} p-6 rounded-xl shadow-lg transition-all duration-300`}>
                            <p><strong>Project Type:</strong> {project.projectType}</p>
                            <p><strong>Difficulty Level:</strong> {project.difficultyLevel}</p>
                        </div>
                        <div className={`${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"} p-6 rounded-xl shadow-lg transition-all duration-300`}>
                            <p>
                                <strong>Duration:</strong>{" "}
                                {new Date(project.duration.startDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}{" "}
                                to{" "}
                                {new Date(project.duration.endDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Additional Project Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"} p-6 rounded-xl shadow-lg transition-all duration-300`}>
                            <p><strong>Maximum Groups Allowed:</strong> {project.maxGroups}</p>
                            <p><strong>Belongs to Which Industry:</strong> {project.industryName}</p>
                        </div>
                        <div className={`${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"} p-6 rounded-xl shadow-lg transition-all duration-300`}>
                            <p><strong>Maximum Students Per Groups:</strong> {project.maxStudentsPerGroup}</p>
                        </div>
                    </div>

                    {/* Required Skills */}
                    <div className={`${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"} p-6 rounded-xl shadow-lg transition-all duration-300`}>
                        <p className="font-semibold mb-4">Required Skills:</p>
                        <ul className="list-disc list-inside">
                            {project.requiredSkills.map((skill, index) => (
                                <li key={index}>{skill}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Additional Info */}
                    {project.additionalInfo && (
                        <div className={`${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"} p-6 rounded-xl shadow-lg transition-all duration-300`}>
                            <p className="font-semibold mb-4">Additional Info:</p>
                            <p>{project.additionalInfo}</p>
                        </div>
                    )}

                    {/* Attachments */}
                    {project.attachments && project.attachments.length > 0 && (
                        <div className={`${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"} p-6 rounded-xl shadow-lg transition-all duration-300`}>
                            <p className="font-semibold mb-4">Attachments:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {project.attachments.map((attachment, index) => (
                                    <div key={index} className={`flex flex-col p-4 rounded-xl ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"} transition-all duration-300 transform hover:scale-105`}>
                                        <div className="flex items-center mb-3">
                                            <i className={`fas fa-file ${theme === "dark" ? "text-gray-300" : "text-gray-500"} text-xl mr-3`}></i>
                                            <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-900"} truncate`} title={attachment.fileName}>
                                                {attachment.fileName}
                                            </span>
                                        </div>
                                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"} mb-3`}>
                                            Uploaded at: {new Date(attachment.uploadedAt).toLocaleDateString()}
                                        </p>
                                        <a
                                            href={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${attachment.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`self-end ${theme === "dark" ? "text-gray-300 hover:text-gray-100" : "text-gray-500 hover:text-gray-700"} transition-colors duration-300`}
                                        >
                                            <i className="text-lg"><Download size={20} /></i>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* Upload Files Modal - For active projects */}
            {
                !selectionDetails?.status?.isCompleted && (
                    <UploadFiles
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="Add Files"
                        theme={theme}
                        name={user.username}
                        email={user.email}
                        onSubmit={handleSubmit}
                    />
                )
            }

            {/* Completed Project Modal */}
            {
                isCompletedModalOpen && (
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
                )
            }


            {/* Extension Request Modal */}
            {isExtensionModalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`p-6 rounded-xl w-full max-w-md shadow-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Request Date Extension</h3>
                            <button
                                onClick={() => setIsExtensionModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">New End Date</label>
                                <input
                                    type="date"
                                    value={extensionData.newEndDate}
                                    onChange={(e) => setExtensionData({ ...extensionData, newEndDate: e.target.value })}
                                    min={new Date(Math.max(
                                        new Date().getTime(),
                                        new Date(project.duration.endDate).getTime()
                                    )).toISOString().split('T')[0]}
                                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition ${theme === "dark"
                                            ? "bg-gray-700 border-gray-600 text-white"
                                            : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Current end date: {new Date(project.duration.endDate).toLocaleDateString()}
                                    </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Reason</label>
                                <textarea
                                    value={extensionData.reason}
                                    onChange={(e) => setExtensionData({ ...extensionData, reason: e.target.value })}
                                    className={`resize-none w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition ${theme === "dark"
                                            ? "bg-gray-700 border-gray-600 text-white"
                                            : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                    rows={5}
                                    placeholder="Explain why you need an extension..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setIsExtensionModalOpen(false)}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${theme === "dark"
                                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitExtensionRequest}
                                    disabled={isSubmittingExtension || !extensionData.newEndDate || !extensionData.reason}
                                    className={`px-4 py-2 rounded-lg font-medium text-white transition ${isSubmittingExtension || !extensionData.newEndDate || !extensionData.reason
                                            ? 'bg-brand-400 cursor-not-allowed'
                                            : 'bg-brand-600 hover:bg-brand-700'
                                        }`}
                                >
                                    {isSubmittingExtension ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </span>
                                    ) : 'Submit Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div >
    )
}

SubmitDeliverables.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default SubmitDeliverables
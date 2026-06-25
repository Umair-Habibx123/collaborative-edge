import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../../../../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import { motion, useScroll } from "framer-motion";
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import { useNavigate } from 'react-router-dom';
import EditApprovalModal from "./Modal/EditApprovalModal.jsx";
import ConfirmationModal from "./Modal/ConfirmationModal.jsx";
import { Lock, ArrowLeft, LogIn, CheckCircle, Info, XCircle, Send, Download } from "lucide-react"
import { User, Mail, Briefcase, Calendar, School } from "lucide-react";

const Action = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [invalidProjectSearch, setInvalidProjectSearch] = useState(false);
    const { user, isAuthLoading } = useAuth();
    const [action, setAction] = useState(null);
    const [showButtons, setShowButtons] = useState(false);
    const [comments, setComments] = useState("");
    const [approvalStatus, setApprovalStatus] = useState(null);
    const [approverUsername, setApproverUsername] = useState(null);
    const [approverEmail, setApproverEmail] = useState(null);
    const [approverProfilePic, setApproverProfilePic] = useState(null);
    const [approverRole, setApproverRole] = useState(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [actionAt, setactionAt] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [university, setUniversity] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentApproval, setCurrentApproval] = useState({
        status: '',
        comments: '',
    });

    const navigate = useNavigate();
    const endOfPageRef = useRef(null); // Ref for scrolling to the bottom
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light"); // Default to light theme


    const containerRef = useRef(null);


    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });


    // Apply theme class to the body element
    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    useEffect(() => {
        if (action && endOfPageRef.current) {
            endOfPageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [action]);

    const handleButtonClick = (actionType) => {
        setAction(actionType);
        setShowButtons(false); // Hide buttons after click
    };

    const [loading, setLoading] = useState(true);

    const fetchUserAndProjects = async () => {
        try {
            setLoading(true);

            if (user?.email) {
                const response = await fetch(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/checkAnyTeacherApproveForYourUni/${id}/${user.teacherDetails.university}`
                );

                if (!response.ok) {
                    setApprovalStatus("pending");
                    setShowButtons(true); // Show buttons for fresh project
                    return;
                }

                const data = await response.json();

                // If the status is not found or the document is not found, assume the status is pending
                if (!data.status || data.status === "pending") {
                    setApprovalStatus("pending");
                    setShowButtons(true); // Show buttons if status is pending or document not found
                } else {
                    setApprovalStatus(data.status);
                    setShowButtons(false); // Hide buttons if status is not pending

                    if (data.status !== "pending") {
                        setApproverUsername(data.userProfile?.username || data.fullName);
                        setApproverEmail(data.userProfile?.email);
                        setApproverProfilePic(data.userProfile?.profilePic);
                        setApproverRole(data.userProfile?.role);
                        setactionAt(data.actionAt);
                        setUniversity(data.userProfile?.teacherDetails.university);
                    }
                }
            } else {
                // If user is not authenticated, do not show buttons
                setApprovalStatus("pending");
                setShowButtons(false); // Hide buttons if user is not authenticated
            }
        } catch (error) {
            toast.error("Error fetching approval status:", error);
            setApprovalStatus("pending"); // Set status to pending in case of an error
            setShowButtons(false); // Hide buttons in case of an error
        } finally {
            setLoading(false); // Set loading to false when fetching completes
        }
    };





    // useEffect(() => {
    //     fetchUserAndProjects();
    // }, []);

    const getMessage = () => {
        switch (action) {
            case 'approved':
                return 'Project Approved';
            case 'needMoreInfo':
                return 'Need More Info';
            case 'rejected':
                return 'Project Rejected';
            default:
                return '';
        }
    };



    const fetchApprovalDetails = async (projectId, teacherId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getApprovalDetailForTeacherWhoApprove/${projectId}?teacherId=${teacherId}`);

            // Check if the response is JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                throw new Error(`Invalid response: ${text}`);
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            toast.error("Error fetching approval details:", error);
            throw error;
        }
    };


    const openEditApprovalModal = async () => {
        setIsLoading(true); // Set loading to true when fetching starts
        try {
            const approvalDetails = await fetchApprovalDetails(id, user.email);
            setCurrentApproval(approvalDetails);
        } catch (error) {
            toast.error("Error fetching approval details:", error);
        } finally {
            setIsLoading(false); // Reset loading state
            setIsModalOpen(true); // Open the modal after fetching data
        }
    };


    const handleSaveApproval = async (updatedApproval) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/updateApproval`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    _id: project._id,
                    teacherId: user.email,
                    ...updatedApproval,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update approval");
            }

            const result = await response.json();
            toast.success("Approval updated successfully:", result);
            // Refresh the approval status
            await fetchUserAndProjects();
        } catch (error) {
            toast.error("Error updating approval:", error);
        }
    };

    const handleSubmitAction = () => {
        if (comments === "") {
            alert("Enter any message to continue....!!!!");
            return;
        }
        setIsConfirmationModalOpen(true); // Show the confirmation modal
    };

    const handleConfirmSubmission = async () => {
        setIsConfirmationModalOpen(false); // Close the confirmation modal
        setIsLoading(true); // Start loading

        try {
            const approvalData = {
                _id: project._id,
                teacherId: user.email,
                fullName: user.username,
                status: action,
                university: user.teacherDetails.university,
                comments: comments,
                actionAt: new Date().toISOString(),
            };

            // Send the approval data to the backend
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/insertTeacherApproval`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(approvalData),
            });

            if (!response.ok) {
                throw new Error("Failed to submit approval");
            }

            const result = await response.json();
            console.log("Approval submitted successfully:", result);

            // Reset states after successful submission
            setAction(null);
            setComments("");
            setShowButtons(false);
            navigate("/teacher-dashboard"); // Navigate back one step in history

        } catch (error) {
            toast.error("Error submitting approval:", error);
        } finally {
            setIsLoading(false); // Stop loading regardless of success or failure
        }
    };

    useEffect(() => {
        // Parallel fetching version
        const fetchData = async () => {
            try {
                setLoading(true);

                await Promise.all([
                    // Fetch project details
                    fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchProjectDetailById/${id}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.message === "Project not found") {
                                setProject(null);
                                setInvalidProjectSearch(true);
                            } else {
                                setProject(data);
                            }
                        }),

                    // Fetch user and projects
                    fetchUserAndProjects()
                ]);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
            finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const isProjectExpired = (endDate) => {
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



    if (invalidProjectSearch || user.role !== "teacher") {
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



    if (!project || isAuthLoading || loading) {
        return (
            <Loading />
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


                {/* Scroll Indicator - Positioned at the bottom of the header */}
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
                    <div className="w-full sm:w-10/12 text-center mb-6 sm:mb-0">
                        <h2 className={`text-3xl sm:text-4xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {project.title}
                        </h2>
                    </div>
                </div>
            </motion.div>

            {isProjectExpired(project.duration.endDate) && (
                <div className={`m-4 p-4 rounded-lg text-center ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-800"}`}>
                    <p className="font-semibold">This project has expired and can no longer take actions.</p>
                    <p>The end date was {new Date(project.duration.endDate).toLocaleDateString()}.</p>
                </div>
            )}


            {/* Content Section - Scrollable */}
            <motion.div
                ref={containerRef}
                className={`p-4 sm:p-8 w-full transition-all duration-300 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
                    }`}
            >
                <motion.div className="space-y-8">
                    {/* Project Description */}
                    <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-700"} transition-colors duration-300`}>
                        {project.description}
                    </p>


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

                    {
                        action && (
                            <div className="py-8 mx-4 text-center">
                                <div className="text-3xl font-semibold flex items-center justify-center space-x-2">
                                    {action === 'approved' && <CheckCircle className="w-8 h-8 text-green-500" />}
                                    {action === 'needMoreInfo' && <Info className="w-8 h-8 text-yellow-500" />}
                                    {action === 'rejected' && <XCircle className="w-8 h-8 text-red-500" />}
                                    <span>{getMessage()}</span>
                                </div>
                            </div>
                        )
                    }

                    {/* Comments Section */}
                    {action && (
                        <div
                            ref={endOfPageRef} // Attach the ref here 
                            className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-900"} p-4 sm:p-6 rounded-lg shadow-sm transition-all duration-300 w-full`}>
                            <p className="font-semibold mb-2 text-lg">Add Comments:</p>
                            <textarea
                                rows="4"
                                placeholder="Enter your comments..."
                                className={`resize-none h-48 w-full p-2 rounded-lg ${theme === "dark" ? "bg-gray-600 text-gray-300" : "bg-white text-gray-900"
                                    } border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 ${theme === "dark" ? "focus:ring-gray-500" : "focus:ring-gray-400"
                                    } transition-all duration-300`}
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                            <button
                                onClick={handleSubmitAction}
                                disabled={isLoading}
                                className="mt-3 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Submit</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}


                    {
                        user.teacherDetails.university === university && (
                            <div className="relative w-full px-4 sm:px-6 lg:px-8">
                                {/* Card Container */}
                                <div
                                    className={`${theme === 'dark'
                                        ? 'bg-gray-900 text-gray-300 border-gray-700'
                                        : 'bg-white text-gray-900 border-gray-200'
                                        } p-6 sm:p-8 mt-8 rounded-3xl shadow-2xl border-2 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 transition-all duration-500 hover:shadow-3xl hover:border-brand-500`}
                                >
                                    {/* Profile Picture or Placeholder */}
                                    <div className="flex-shrink-0 relative group">
                                        {approverProfilePic ? (
                                            <img
                                                src={approverProfilePic}
                                                alt="Approver Profile"
                                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-brand-500 shadow-lg object-cover transition-transform transform hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                                                {approverUsername?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* User Information */}
                                    <div className="text-center sm:text-left flex-1 space-y-3">
                                        <h3 className="text-xl sm:text-2xl font-bold flex flex-col sm:flex-row sm:items-center gap-3">
                                            <User className="w-6 h-6 sm:w-8 sm:h-8 text-brand-500" />
                                            <span>Response by: {approverUsername}</span>
                                            {user.email === approverEmail && approvalStatus === 'approved' && (
                                                <span className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-md flex items-center space-x-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>Approved by You</span>
                                                </span>
                                            )}
                                            {user.email === approverEmail && approvalStatus === 'rejected' && (
                                                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-md flex items-center space-x-1">
                                                    <XCircle className="w-4 h-4" />
                                                    <span>Rejected by You</span>
                                                </span>
                                            )}
                                            {user.email === approverEmail && approvalStatus === 'needMoreInfo' && (
                                                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-md flex items-center space-x-1">
                                                    <Info className="w-4 h-4" />
                                                    <span>More Info Requested By You</span>
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-500 flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-brand-500" />
                                            <span>Email: {approverEmail}</span>
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center space-x-2">
                                            <Briefcase className="w-4 h-4 text-brand-500" />
                                            <span>Role: {approverRole}</span>
                                        </p>
                                        <p className="text-sm text-brand-500 font-medium flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-brand-500" />
                                            <span>Approved At: {new Date(actionAt).toLocaleString()}</span>
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center space-x-2">
                                            <School className="w-4 h-4 text-brand-500" />
                                            <span>University: {university}</span>
                                        </p>
                                    </div>
                                </div>
                                {/* Edit Button (Responsive Positioning) */}

                                {user.email === approverEmail && approvalStatus === 'needMoreInfo' && (
                                    <div className="flex justify-center sm:justify-end mt-4 sm:absolute sm:bottom-6 sm:right-6">
                                        <button
                                            onClick={openEditApprovalModal}
                                            className="bg-brand-500 hover:bg-brand-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center disabled:opacity-50"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg
                                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        />
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        />
                                                    </svg>
                                                    Loading...
                                                </>
                                            ) : (
                                                "Edit Approval"
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    }


                    <div className="flex flex-col space-y-6 mt-6">
                        {/* Conditionally render buttons based on showButtons state */}
                        {showButtons && !isProjectExpired(project.duration.endDate) && (
                            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                {/* Approve Button */}
                                <button
                                    onClick={() => handleButtonClick("approved")}
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-xl hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Approve</span>
                                </button>

                                {/* Need More Info Button */}
                                <button
                                    onClick={() => handleButtonClick("needMoreInfo")}
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2"
                                >
                                    <Info className="w-5 h-5" />
                                    <span>Need More Info</span>
                                </button>

                                {/* Reject Button */}
                                <button
                                    onClick={() => handleButtonClick("rejected")}
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold rounded-xl hover:from-red-500 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2"
                                >
                                    <XCircle className="w-5 h-5" />
                                    <span>Reject</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {
                        isConfirmationModalOpen && (
                            <ConfirmationModal
                                theme={theme}
                                isOpen={isConfirmationModalOpen}
                                onClose={() => setIsConfirmationModalOpen(false)}
                                onConfirm={handleConfirmSubmission}
                            />
                        )
                    }

                    {
                        currentApproval && (
                            <EditApprovalModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                approval={currentApproval}
                                onSubmit={handleSaveApproval}
                                theme={theme}
                            />
                        )
                    }
                </motion.div>
            </motion.div>
        </div>

    );
};

Action.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default Action;
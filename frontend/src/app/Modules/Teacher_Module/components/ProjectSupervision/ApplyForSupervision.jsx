import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify"
import { motion, useScroll } from "framer-motion";
import { useAuth } from "../../../../../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, LogIn, Download, User, ArrowLeftIcon } from "lucide-react"
import { UserCheck, Send, Clock, CheckCircle, XCircle, MessageCircle, Mail } from "lucide-react";

const ProjectSupervision = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [invalidProjectSearch, setInvalidProjectSearch] = useState(false);
    const [status, setStatus] = useState(null);
    const { user, isAuthLoading } = useAuth();
    const [approvedTeacher, setApprovedTeacher] = useState(null);
    const [canApplyForSupervision, setCanApplyForSupervision] = useState(false);
    const [supervisionStatus, setSupervisionStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState(null);

    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light"); // Default to light theme

    const containerRef = useRef(null);
    const navigate = useNavigate();

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Apply theme class to the body element
    useEffect(() => {
        document.body.className = theme;
    }, [theme]);


    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                // 1. Fetch project details
                const projectPromise = fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchProjectDetailById/${id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.message === "Project not found") {
                            setProject("Project not found");
                            setInvalidProjectSearch(true);
                            return null;
                        }
                        setProject(data);
                        return data;
                    });

                // 2. Fetch approval status (only if user is available)
                const approvalPromise = user && user.teacherDetails?.university
                    ? fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/approval-status/${id}/${user.teacherDetails.university}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data?.data?.length > 0) {
                                setStatus(data.data[0].status);
                            } else {
                                setStatus("not_found");
                                setInvalidProjectSearch(true);
                            }
                            return data;
                        })
                    : Promise.resolve(null);

                // 3. Fetch teacher supervision (only if user is available)
                const supervisionPromise = user?.email && user.teacherDetails?.university
                    ? (async () => {
                        // First check if another teacher is approved
                        const approvalResponse = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/checkOtherTeacherApproval`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                projectId: id,
                                email: user.email,
                                university: user.teacherDetails.university,
                            }),
                        });

                        const approvalData = await approvalResponse.json();

                        if (approvalData.exists && approvalData.status === "approved") {
                            const teacherProfileResponse = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/other-user-profile?email=${approvalData.approvedTeacher.email}`);
                            const teacherProfileData = await teacherProfileResponse.json();
                            setApprovedTeacher(teacherProfileData);
                            setCanApplyForSupervision(false);
                            return;
                        }

                        // Check current teacher's supervision status
                        const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/currentTeacherSupervisionStatusForProject`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                projectId: id,
                                email: user.email,
                                university: user.teacherDetails.university,
                            }),
                        });

                        const data = await response.json();

                        // Handle all supervision status cases
                        if (data.message === "Teacher supervision not found" && !data.exists) {
                            setCanApplyForSupervision(true);
                        } else if (data.message === "Project not found") {
                            setCanApplyForSupervision(true);
                        } else if (data.message === "Current Teacher supervision not found") {
                            setCanApplyForSupervision(true);
                        } else if (data.message === "Current Teacher supervision pending") {
                            setSupervisionStatus("pending");
                            setCanApplyForSupervision(false);
                        } else if (data.message === "Current Teacher supervision approved") {
                            setSupervisionStatus("approved");
                            setCanApplyForSupervision(false);
                            setComments(data.responseFromInd?.comments || null);
                        } else if (data.message === "Current Teacher supervision rejected") {
                            setSupervisionStatus("rejected");
                            setCanApplyForSupervision(false);
                            setComments(data.responseFromInd?.comments || null);
                        }
                    })()
                    : Promise.resolve(null);

                // Wait for all promises to complete
                await Promise.all([projectPromise, approvalPromise, supervisionPromise]);

            } catch (error) {
                console.error("Error in combined data fetching:", error);
                toast.error("Error loading project data");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id, user]); // Only these dependencies needed


    const handleApplyForSupervision = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/insertTeacherSupervisionRequest`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    _id: id,
                    teacherId: user.email,
                    fullName: user.username,
                    university: user.teacherDetails.university,
                    email: user.email,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setCanApplyForSupervision(false);
                setSupervisionStatus("pending");
                toast.success("Supervision request submitted successfully!");
            } else {
                toast.error(data.error || "Failed to submit supervision request.");
            }
        } catch (error) {
            toast.error("Error applying for supervision:", error);
        } finally {
            setLoading(false); // Set loading to false when applying completes
        }
    };


    const isProjectExpired = (endDate) => {
        if (!endDate) return false;
        const today = new Date();
        const projectEndDate = new Date(endDate);
        return today > projectEndDate;
    };


    if (isAuthLoading || loading) {
        return <Loading />;
    }

    if (!(user?.email)) {
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


    if (invalidProjectSearch || status !== "approved" || user.role !== "teacher") {
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
                            <ArrowLeftIcon />
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
                    <div className="space-y-6">
                        {/* Approved Supervisor Section */}
                        {approvedTeacher && (
                            <div className={`${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-900"} p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl`}>
                                <p className="font-semibold text-lg mb-4 flex items-center space-x-2">
                                    <UserCheck className="w-6 h-6 text-brand-500" />
                                    <span>Approved Supervisor:</span>
                                </p>
                                <div className="flex items-center space-x-4">
                                    {approvedTeacher.profilePic ? (
                                        <img
                                            src={approvedTeacher.profilePic}
                                            alt={approvedTeacher.username}
                                            className="w-14 h-14 rounded-full border-2 border-brand-500 shadow-md"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-brand-500 shadow-md bg-gray-100 text-brand-500">
                                            <User className="w-7 h-7" />
                                        </div>
                                    )}

                                    <div>
                                        <p className="font-semibold text-xl">{approvedTeacher.username}</p>
                                        <p className="text-sm text-gray-500 flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-brand-500" />
                                            <span>{approvedTeacher.email}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Apply for Supervision Section */}
                        {canApplyForSupervision && !approvedTeacher && !isProjectExpired(project.duration.endDate) && (
                            <div className={`${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-900"} p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl`}>
                                <button
                                    onClick={handleApplyForSupervision}
                                    className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center w-full space-x-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Apply for Supervision</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Pending Approval Section */}
                        {supervisionStatus === "pending" && (
                            <div className={`${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-900"} p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl`}>
                                <button className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl w-full flex items-center justify-center space-x-2" disabled>
                                    <Clock className="w-5 h-5" />
                                    <span>Pending Approval</span>
                                </button>
                            </div>
                        )}

                        {/* Approved Section */}
                        {supervisionStatus === "approved" && (
                            <div className={`${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-900"} p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl`}>
                                <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl w-full flex items-center justify-center space-x-2" disabled>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Approved By Industry Representative</span>
                                </button>
                                {comments && (
                                    <p className="mt-4 text-sm text-gray-500 flex items-center space-x-2">
                                        <MessageCircle className="w-4 h-4 text-brand-500" />
                                        <span>Comments: {comments}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Rejected Section */}
                        {supervisionStatus === "rejected" && (
                            <div className={`${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-900"} p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl`}>
                                <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl w-full flex items-center justify-center space-x-2" disabled>
                                    <XCircle className="w-5 h-5" />
                                    <span>Rejected By Industry Representative</span>
                                </button>
                                {comments && (
                                    <p className="mt-4 text-sm text-gray-500 flex items-center space-x-2">
                                        <MessageCircle className="w-4 h-4 text-brand-500" />
                                        <span>Comments: {comments}</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>

    );
};

ProjectSupervision.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default ProjectSupervision;

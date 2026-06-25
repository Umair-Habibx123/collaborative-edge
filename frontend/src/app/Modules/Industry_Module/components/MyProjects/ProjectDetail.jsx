import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, useScroll } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import ProjectEdit from "./projectEdit.jsx";
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import DeleteConfirmationModal from "./Modal/DeletingModal.jsx";
import UniversityApprovalModal from "./Modal/UniversityApprovalModal.jsx"
import { Lock, ArrowLeft, LogIn, Download, CircleX, Edit, Trash2, Send } from "lucide-react"

const ProjectDetail = () => {
    const { id } = useParams()
    const [project, setProject] = useState(null);
    const [editing, setEditing] = useState(false);
    const { user, isAuthLoading } = useAuth();
    const [deletingConfirmModal, setdeletingConfirmModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [universityApprovals, setUniversityApprovals] = useState([]);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [modificationRequests, setModificationRequests] = useState([]);

    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    const [approvedUniversities, setApprovedUniversities] = useState([]);
    const [rejectedUniversities, setRejectedUniversities] = useState([]);
    const [needMoreInfoUniversities, setNeedMoreInfoUniversities] = useState([]);

    const containerRef = useRef(null);

    const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);
    const [isDeleteRequestModalOpen, setIsDeleteRequestModalOpen] = useState(false);
    const [requestReason, setRequestReason] = useState("");

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });


    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    const fetchModificationRequests = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getModificationRequests/${id}`);
            if (response.ok) {
                const data = await response.json();
                setModificationRequests(data.requests || []);
            }
        } catch (error) {
            console.error("Error fetching modification requests:", error);
            toast.error("Error fetching modification requests");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestEdit = async () => {
        if (!requestReason.trim()) {
            toast.error("Please provide a reason for the edit request");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/createProjectModificationRequest`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    projectId: project._id,
                    requestType: "edit",
                    requestedBy: user.email,
                    reason: requestReason,
                }),
            });

            if (response.ok) {
                toast.success("Edit request submitted successfully!");
                setIsEditRequestModalOpen(false);
                setRequestReason("");
                fetchModificationRequests(); // Refresh requests after submission
            } else {
                toast.error("Failed to submit edit request");
            }
        } catch (error) {
            console.error("Error submitting edit request:", error);
            toast.error("Error submitting edit request");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestDelete = async () => {
        if (!requestReason.trim()) {
            toast.error("Please provide a reason for the delete request");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/createProjectModificationRequest`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    projectId: project._id,
                    requestType: "delete",
                    requestedBy: user.email,
                    reason: requestReason,
                }),
            });

            if (response.ok) {
                toast.success("Delete request submitted successfully!");
                setIsDeleteRequestModalOpen(false);
                setRequestReason("");
                fetchModificationRequests(); // Refresh requests after submission
            } else {
                toast.error("Failed to submit delete request");
            }
        } catch (error) {
            console.error("Error submitting delete request:", error);
            toast.error("Error submitting delete request");
        } finally {
            setLoading(false);
        }
    };


    const handleCancelEdit = () => {
        setEditing(false);
    };

    const handleDelete = async () => {
        if (!project || !project._id) {
            toast.error("Project ID is missing!");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/deleteProject/${project._id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Project deleted successfully!");
                setTimeout(() => navigate(-1), 1000);
            } else {
                toast.error("Failed to delete project");
            }
        } catch (error) {
            console.error("Error deleting project:", error);
            toast.error("Error deleting project");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchProjectDetailById/${id}`)
            .then((res) => res.json())
            .then((data) => setProject(data))
            .catch((err) => console.error("Error fetching project details:", err));
    }, [id]);


    useEffect(() => {
        const fetchUniversitiesStatus = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getUniversitiesStatusAcrossProject?projectIds=${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setApprovedUniversities(data.approvedUniversities || []);
                    setRejectedUniversities(data.rejectedUniversities || []);
                    setNeedMoreInfoUniversities(data.needMoreInfoUniversities || []);
                } else {
                    console.error("Failed to fetch universities status");
                }
            } catch (error) {
                console.error("Error fetching universities status:", error);
            }
        };

        if (id && project?.editStatus === "locked") {
            fetchModificationRequests();
        }

        if (id) {
            fetchUniversitiesStatus();
        }
    }, [id, project?.editStatus]);


    const hasPendingEditRequest = modificationRequests.some(
        request => request.requestType === "edit" && request.requestStatus === "pending"
    );

    const hasPendingDeleteRequest = modificationRequests.some(
        request => request.requestType === "delete" && request.requestStatus === "pending"
    );



    const fetchUniversityApprovals = async (universityName) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getUniversityApprovals?projectId=${id}&university=${universityName}`
            );
            if (response.ok) {
                const data = await response.json();
                setUniversityApprovals(data.approvals || []);
                setIsApprovalModalOpen(true);
            } else {
                toast.error("Failed to fetch approval details");
            }
        } catch (error) {
            console.error("Error fetching approval details:", error);
            toast.error("Error fetching approval details");
        } finally {
            setLoading(false);
        }
    };

    const handleUniversityClick = (universityName) => {
        setSelectedUniversity(universityName);
        fetchUniversityApprovals(universityName);
    };

    if (!project || isAuthLoading || loading) {
        return <Loading />;
    }

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


    if (user.email !== project.representativeId || user.role !== "industry") {
        return (
            <div className={`-mt-[70px] md:-mt-[90px] min-h-screen flex items-center justify-center p-6 ${theme === "dark" ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-900"}`}>
                <div className={`${theme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-gray-800 to-gray-700"} text-white p-8 md:p-12 rounded-2xl shadow-2xl max-w-lg w-full text-center transition-all duration-300`}>
                    <div className="flex items-center justify-center mb-6">
                        <Lock className="w-16 h-16 text-red-500 animate-pulse" />
                    </div>
                    <h2 className="text-4xl font-extrabold mb-4">Access Denied</h2>
                    <p className="text-lg mb-6">You do not have permission to view this project.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className={`px-6 py-3 ${theme === "dark" ? "bg-gradient-to-r from-red-600 to-red-700" : "bg-gradient-to-r from-red-500 to-red-600"} text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg font-semibold flex items-center justify-center mx-auto`}
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
                            <ArrowLeft />
                            <span>Back</span>
                        </button>
                    </div>

                    {/* Project Title and Buttons Container */}
                    <div className="w-full flex flex-row items-center justify-between sm:w-10/12 sm:space-x-4">
                        {/* Edit Button (Visible on Small Screens) */}
                        {project.editStatus === "unlocked" && (
                            <button
                                onClick={() => setEditing(!editing)}
                                className={`p-3 rounded-xl sm:hidden ${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                    } transition-all duration-300 transform hover:scale-110`}
                            >
                                {editing ? <CircleX size={24} /> : <Edit size={24} />}
                            </button>
                        )}

                        {/* Project Title */}
                        <div className="w-full text-center mb-6 sm:mb-0">
                            <h2 className={`text-3xl sm:text-4xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                {project.title}
                            </h2>
                        </div>

                        {/* Delete Button (Visible on Small Screens) */}
                        {project.editStatus === "unlocked" && (
                            <button
                                onClick={() => setdeletingConfirmModal(true)}
                                className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300 transform hover:scale-110 sm:hidden"
                            >
                                <Trash2 size={24} />
                            </button>
                        )}

                        {/* Request Buttons (Visible on Small Screens when locked) */}
                        {project.editStatus === "locked" && (
                            <div className="flex space-x-2 sm:hidden">
                                <button
                                    onClick={() => setIsEditRequestModalOpen(true)}
                                    disabled={hasPendingEditRequest || hasPendingDeleteRequest}
                                    className={`p-3 rounded-xl ${theme === "dark"
                                            ? hasPendingEditRequest || hasPendingDeleteRequest
                                                ? "bg-gray-700 text-gray-400"
                                                : "bg-brand-700 text-gray-300 hover:bg-brand-600"
                                            : hasPendingEditRequest || hasPendingDeleteRequest
                                                ? "bg-gray-200 text-gray-400"
                                                : "bg-brand-200 text-brand-600 hover:bg-brand-300"
                                        } flex items-center ${hasPendingEditRequest || hasPendingDeleteRequest ? "cursor-not-allowed" : ""}`}
                                >
                                    <Send size={20} />
                                </button>
                                <button
                                    onClick={() => setIsDeleteRequestModalOpen(true)}
                                    disabled={hasPendingDeleteRequest || hasPendingEditRequest}
                                    className={`p-3 rounded-xl ${hasPendingDeleteRequest || hasPendingEditRequest
                                            ? theme === "dark"
                                                ? "bg-gray-700 text-gray-400"
                                                : "bg-gray-200 text-gray-400"
                                            : "bg-red-100 text-red-600 hover:bg-red-200"
                                        } flex items-center ${hasPendingDeleteRequest || hasPendingEditRequest ? "cursor-not-allowed" : ""}`}
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        )}

                        {/* Edit and Delete Buttons (Visible on Larger Screens) */}
                        <div className="hidden sm:flex space-x-4">
                            {project.editStatus === "unlocked" && (
                                <button
                                    onClick={() => setEditing(!editing)}
                                    className={`p-3 rounded-xl ${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                        } transition-all duration-300 transform hover:scale-110`}
                                >
                                    {editing ? <CircleX size={24} /> : <Edit size={24} />}
                                </button>
                            )}
                            {project.editStatus === "unlocked" && (
                                <button
                                    onClick={() => setdeletingConfirmModal(true)}
                                    className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300 transform hover:scale-110"
                                >
                                    <Trash2 size={24} />
                                </button>
                            )}
                            {project.editStatus === "locked" && (
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setIsEditRequestModalOpen(true)}
                                        disabled={hasPendingEditRequest || hasPendingDeleteRequest}
                                        className={`p-3 rounded-xl flex items-center ${theme === "dark"
                                                ? hasPendingEditRequest || hasPendingDeleteRequest
                                                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                                    : "bg-brand-700 text-gray-300 hover:bg-brand-600"
                                                : hasPendingEditRequest || hasPendingDeleteRequest
                                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                    : "bg-brand-200 text-brand-600 hover:bg-brand-300"
                                            }`}
                                    >
                                        <Send size={20} className="mr-2" />
                                        <span>Request Edit</span>
                                    </button>
                                    <button
                                        onClick={() => setIsDeleteRequestModalOpen(true)}
                                        disabled={hasPendingDeleteRequest || hasPendingEditRequest}
                                        className={`p-3 rounded-xl flex items-center ${hasPendingDeleteRequest || hasPendingEditRequest
                                                ? theme === "dark"
                                                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : "bg-red-100 text-red-600 hover:bg-red-200"
                                            }`}
                                    >
                                        <Send size={20} className="mr-2" />
                                        <span>Request Delete</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Show info about pending requests */}
                {(hasPendingEditRequest || hasPendingDeleteRequest) && (
                    <div className={`mt-4 p-3 rounded-lg ${theme === "dark" ? "bg-brand-900/30 text-brand-200" : "bg-brand-100 text-brand-800"
                        }`}>
                        {hasPendingEditRequest && (
                            <p>You have a pending edit request for this project.</p>
                        )}
                        {hasPendingDeleteRequest && (
                            <p>You have a pending delete request for this project.</p>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Content Section - Scrollable */}
            <motion.div
                ref={containerRef}
                className={`p-4 sm:p-8 w-full transition-all duration-300 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
                    }`}
            >
                {editing ? (
                    project ? <ProjectEdit project={project} onCancel={handleCancelEdit} /> : <p>Loading...</p>
                ) : (
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

                        {/* Approved Universities */}
                        <div className={`${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"} p-6 rounded-xl shadow-lg transition-all duration-300`}>
                            <p className="font-semibold mb-4">Approved Universities:</p>
                            <ul className="list-disc list-inside">
                                {approvedUniversities.map((university, index) => (
                                    <li
                                        key={index}
                                        className="cursor-pointer hover:underline"
                                        onClick={() => handleUniversityClick(university)}
                                    >
                                        {university}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Rejected Universities */}
                        <div className={`${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"} p-6 rounded-xl shadow-lg transition-all duration-300`}>
                            <p className="font-semibold mb-4">Rejected Universities:</p>
                            <ul className="list-disc list-inside">
                                {rejectedUniversities.map((university, index) => (
                                    <li
                                        key={index}
                                        className="cursor-pointer hover:underline"
                                        onClick={() => handleUniversityClick(university)}
                                    >
                                        {university}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Need More Info Universities */}
                        <div className={`${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"} p-6 rounded-xl shadow-lg transition-all duration-300`}>
                            <p className="font-semibold mb-4">Need More Info Universities:</p>
                            <ul className="list-disc list-inside">
                                {needMoreInfoUniversities.map((university, index) => (
                                    <li
                                        key={index}
                                        className="cursor-pointer hover:underline"
                                        onClick={() => handleUniversityClick(university)}
                                    >
                                        {university}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={deletingConfirmModal}
                    onClose={() => setdeletingConfirmModal(false)}
                    onConfirm={handleDelete}
                    loading={loading}
                    theme={theme}
                    projectTitle={project.title}
                />


                <UniversityApprovalModal
                    isOpen={isApprovalModalOpen}
                    onClose={() => setIsApprovalModalOpen(false)}
                    approvals={universityApprovals}
                    theme={theme}
                />

            </motion.div>

            {/* Edit Request Modal */}
            {isEditRequestModalOpen && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm`}>
                    <div className={`rounded-xl shadow-2xl p-6 w-full max-w-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                        <h3 className="text-xl font-bold mb-4">Request Project Edit</h3>

                        <div className="space-y-4 mb-6">

                            <div>
                                <label className="block mb-2">Reason for Edit</label>
                                <textarea
                                    value={requestReason}
                                    onChange={(e) => setRequestReason(e.target.value)}
                                    rows={3}
                                    className={`w-full p-3 rounded-lg ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100"}`}
                                    placeholder="Explain why you need to edit this project..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setIsEditRequestModalOpen(false)}
                                className={`px-4 py-2 rounded-lg ${theme === "dark" ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestEdit}
                                disabled={loading}
                                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Request Modal */}
            {isDeleteRequestModalOpen && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4  bg-black/40 backdrop-blur-sm`}>
                    <div className={`rounded-xl shadow-2xl p-6 w-full max-w-md ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                        <h3 className="text-xl font-bold mb-4">Request Project Deletion</h3>

                        <div className="mb-6">
                            <p className="mb-4">You are requesting to delete the project: <strong>{project.title}</strong></p>

                            <div>
                                <label className="block mb-2">Reason for Deletion</label>
                                <textarea
                                    value={requestReason}
                                    onChange={(e) => setRequestReason(e.target.value)}
                                    rows={3}
                                    className={`w-full p-3 rounded-lg ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100"}`}
                                    placeholder="Explain why this project should be deleted..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setIsDeleteRequestModalOpen(false)}
                                className={`px-4 py-2 rounded-lg ${theme === "dark" ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestDelete}
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

ProjectDetail.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default ProjectDetail;
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../../../Components/loadingIndicator/loading';
import { useNavigate } from "react-router-dom";
import AddCommentModal from './Modal/AddCommentModal.jsx';
import ViewTeacherModal from './Modal/ViewTeacherDetails.jsx';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from "../../../../../auth/AuthContext.jsx";
import { Lock, ArrowLeft, Search, FolderSearch, Check, X, School, User, BadgeCheck, Mail, Trash2, Eye, Loader2, LogIn } from "lucide-react";


const ViewSupervision = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [comments, setComments] = useState('');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentTeacherId, setCurrentTeacherId] = useState(null);
    const [currentUniversity, setCurrentUniversity] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const { user, isAuthLoading } = useAuth();
    const [loadingStates, setLoadingStates] = useState({});
    const [project, setProject] = useState(null);
    const { projectId } = useParams();
    const [supervisions, setSupervisions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const navigate = useNavigate();

    // Apply theme class to the body element
    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    useEffect(() => {
        // Fetch project details from API
        fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchProjectDetailById/${projectId}`)
            .then((res) => res.json())
            .then((data) => setProject(data))
            .catch((err) => console.error("Error fetching project details:", err));
    }, [projectId]);

    useEffect(() => {
        const fetchSupervisions = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getSupervisions`, {
                    params: { projectId },
                });
                setSupervisions(response.data.supervisedBy);
            } catch (error) {
                console.error("Error fetching supervisions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSupervisions();
    }, [projectId]);

    // Extract unique universities and sort them alphabetically
    const uniqueUniversities = [...new Set(supervisions.map(supervision => supervision.university))].sort();

    // Set the default selected university to the first one in the sorted list
    useEffect(() => {
        if (!selectedUniversity && uniqueUniversities.length > 0) {
            setSelectedUniversity(uniqueUniversities[0]);
        }
    }, [selectedUniversity, uniqueUniversities]);

    const handleApprove = (teacherId, university) => {
        setCurrentTeacherId(teacherId);
        setCurrentUniversity(university);
        setIsModalOpen(true);
    };

    const handleConfirmApprove = async () => {
        setIsSaving(true);
        try {
            await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/updateSupervisionStatus`, {
                projectId,
                teacherId: currentTeacherId,
                status: 'approved',
                actionBy: user.email,
                comments: comments,
            });
            setSupervisions(prevSupervisions =>
                prevSupervisions.map(supervision =>
                    supervision.teacherId === currentTeacherId
                        ? { ...supervision, responseFromInd: { ...supervision.responseFromInd, status: 'approved', comments } }
                        : supervision
                )
            );
            toast.success('Supervision approved successfully!');
        } catch (error) {
            console.error("Error updating supervision status:", error);
            toast.error('Failed to approve supervision.');
        } finally {
            setIsSaving(false);
            setIsModalOpen(false);
            setComments('');
        }
    };

    const handleReject = async (teacherId) => {
        try {
            await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/updateSupervisionStatus`, {
                projectId,
                teacherId,
                status: 'rejected',
                actionBy: user.email,
                comments: 'Rejected by project owner',
            });
            setSupervisions(prevSupervisions =>
                prevSupervisions.map(supervision =>
                    supervision.teacherId === teacherId
                        ? { ...supervision, responseFromInd: { ...supervision.responseFromInd, status: 'rejected', comments: 'Rejected by project owner' } }
                        : supervision
                )
            );
            toast.success('Supervision rejected successfully!');
        } catch (error) {
            console.error("Error rejecting supervision:", error);
            toast.error('Failed to reject supervision.');
        }
    };

    const handleDelete = async (teacherId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/deleteSupervision`, {
                data: { projectId, teacherId },
            });
            setSupervisions(prevSupervisions =>
                prevSupervisions.filter(supervision => supervision.teacherId !== teacherId)
            );
            toast.success('Supervision deleted successfully!');
        } catch (error) {
            console.error("Error deleting supervision:", error);
            toast.error('Failed to delete supervision.');
        }
    };


    const handleCloseModal = () => {
        setIsViewModalOpen(false);
        setSelectedUser(null);
    };


    const handleViewDetail = async (teacherId) => {
        setLoadingStates((prev) => ({ ...prev, [teacherId]: true })); // Set loading for specific row

        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/other-user-profile`, {
                params: { email: teacherId },
            });

            if (response.data) {
                setSelectedUser(response.data);
                setIsViewModalOpen(true);
            } else {
                toast.error("User details not found.");
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
            toast.error("Failed to fetch user details.");
        } finally {
            setLoadingStates((prev) => ({ ...prev, [teacherId]: false })); // Reset loading for specific row
        }
    };


    const filteredSupervisions = supervisions.filter(supervision =>
        (!selectedUniversity || supervision.university === selectedUniversity) &&
        (!searchQuery || supervision.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    );


    const hasApprovedTeacher = supervisions.some(
        supervision => supervision.responseFromInd.status === 'approved'
    );

    if (!project || isAuthLoading) {
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

    // Check if the logged-in user is the project owner/ uploader
    if (user.email !== project.representativeId || user.role !== "industry") {
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
        <div className={`w-full min-h-screen p-6 -mt-[70px] md:-mt-[90px] transition-all duration-300 ${theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900"}`}>

            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl shadow-md transition-all duration-200 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white hover:shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </button>

                    <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-brand-500 via-brand-500 to-pink-500 bg-clip-text text-transparent">
                        Teacher Supervision
                    </h2>

                    <div className="w-full md:w-auto"></div> {/* Spacer for alignment */}
                </div>

                {/* Modals */}
                <AddCommentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmApprove}
                    isLoading={isSaving}
                    comments={comments}
                    setComments={setComments}
                />

                <ViewTeacherModal
                    isOpen={isViewModalOpen}
                    onClose={handleCloseModal}
                    userDetails={selectedUser}
                    theme={theme}
                />

                <ToastContainer position="top-right" theme={theme} />

                {/* Search and Filter */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`flex items-center rounded-xl p-1 shadow-sm transition-all duration-300 ${theme === "dark"
                        ? "bg-gray-800 border-gray-700 focus-within:border-brand-500 border"
                        : "bg-white border-gray-200 focus-within:border-brand-400 border"}`}>
                        <div className="p-2 text-gray-500">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search teachers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full p-2 focus:outline-none rounded-r-lg ${theme === "dark"
                                ? "bg-gray-800 placeholder-gray-500"
                                : "bg-white placeholder-gray-400"}`}
                        />
                    </div>

                    <div className="flex gap-4">
                        <select
                            id="university"
                            value={selectedUniversity}
                            onChange={(e) => setSelectedUniversity(e.target.value)}
                            className={`flex-1 p-3 rounded-xl shadow-sm transition-all duration-200 ${theme === "dark"
                                ? "bg-gray-800 border-gray-700 text-white"
                                : "bg-white border-gray-200 text-gray-900"} border`}
                        >
                            {uniqueUniversities.length > 0 ? (
                                uniqueUniversities.map((university, index) => (
                                    <option key={index} value={university}>
                                        {university}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No universities available</option>
                            )}
                        </select>
                    </div>
                </div>

                {/* Table Content */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
                            <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                Loading supervision data...
                            </p>
                        </div>
                    </div>
                ) : filteredSupervisions.length > 0 ? (
                    <div className={`rounded-2xl overflow-hidden shadow-xl ${theme === "dark"
                        ? "bg-gray-800/80 border border-gray-700"
                        : "bg-white border border-gray-100"}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={`${theme === "dark"
                                        ? "bg-gradient-to-r from-gray-700 to-gray-800"
                                        : "bg-gradient-to-r from-gray-100 to-gray-200"} text-left`}>
                                        <th className="p-4 font-semibold">Teacher</th>
                                        <th className="p-4 font-semibold">University</th>
                                        <th className="p-4 font-semibold">Contact</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredSupervisions.map((supervision, index) => (
                                        <tr
                                            key={index}
                                            className={`transition-colors duration-150 ${theme === "dark"
                                                ? "hover:bg-gray-700/50"
                                                : "hover:bg-gray-50"}`}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === "dark"
                                                        ? "bg-gray-700"
                                                        : "bg-gray-100"}`}>
                                                        <User className="w-5 h-5 text-brand-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{supervision.fullName}</p>
                                                        <p className={`text-sm ${theme === "dark"
                                                            ? "text-gray-400"
                                                            : "text-gray-500"}`}>
                                                            {supervision.responseFromInd.comments || "No comments"}
                                                        </p>
                                                    </div>
                                                    {supervision.responseFromInd.status === "approved" && (
                                                        <BadgeCheck className="ml-2 text-green-500" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <School className="w-4 h-4 text-brand-500" />
                                                    <span>{supervision.university}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <a
                                                    href={`mailto:${supervision.email}`}
                                                    className="flex items-center gap-2 hover:text-brand-500 transition-colors"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                    <span className="truncate max-w-[180px]">{supervision.email}</span>
                                                </a>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${supervision.responseFromInd.status === "approved"
                                                    ? (theme === "dark"
                                                        ? "bg-green-900/50 text-green-300"
                                                        : "bg-green-100 text-green-800")
                                                    : supervision.responseFromInd.status === "rejected"
                                                        ? (theme === "dark"
                                                            ? "bg-red-900/50 text-red-300"
                                                            : "bg-red-100 text-red-800")
                                                        : (theme === "dark"
                                                            ? "bg-yellow-900/50 text-yellow-300"
                                                            : "bg-yellow-100 text-yellow-800")}`}>
                                                    {supervision.responseFromInd.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {!hasApprovedTeacher && supervision.responseFromInd.status !== "approved" && (
                                                        <button
                                                            onClick={() => handleApprove(supervision.teacherId, supervision.university)}
                                                            className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${theme === "dark"
                                                                ? "bg-green-600 hover:bg-green-700"
                                                                : "bg-green-500 hover:bg-green-600"} text-white shadow-sm hover:shadow-md`}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            <span>Approve</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleReject(supervision.teacherId)}
                                                        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${theme === "dark"
                                                            ? "bg-red-600 hover:bg-red-700"
                                                            : "bg-red-500 hover:bg-red-600"} text-white shadow-sm hover:shadow-md`}
                                                    >
                                                        <X className="w-4 h-4" />
                                                        <span>Reject</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewDetail(supervision.teacherId)}
                                                        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${theme === "dark"
                                                            ? "bg-brand-600 hover:bg-brand-700"
                                                            : "bg-brand-500 hover:bg-brand-600"} text-white shadow-sm hover:shadow-md`}
                                                        disabled={loadingStates[supervision.teacherId]}
                                                    >
                                                        {loadingStates[supervision.teacherId] ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Eye className="w-4 h-4" />
                                                                <span>View</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(supervision.teacherId)}
                                                        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${theme === "dark"
                                                            ? "bg-gray-600 hover:bg-gray-700"
                                                            : "bg-gray-500 hover:bg-gray-600"} text-white shadow-sm hover:shadow-md`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className={`rounded-2xl p-12 text-center ${theme === "dark"
                        ? "bg-gray-800/50 border border-gray-700"
                        : "bg-white border border-gray-100"} shadow-xl`}>
                        <div className="max-w-md mx-auto flex flex-col items-center">
                            <FolderSearch className="w-16 h-16 text-gray-400 mb-4" />
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent mb-2">
                                No Supervisions Found
                            </h3>
                            <p className={`mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                {searchQuery || selectedUniversity !== "all"
                                    ? "No results match your search criteria"
                                    : "There are currently no teacher supervisions to display"}
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedUniversity("all");
                                }}
                                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${theme === "dark"
                                    ? "bg-gray-700 hover:bg-gray-600"
                                    : "bg-gray-200 hover:bg-gray-300"}`}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};

export default ViewSupervision;
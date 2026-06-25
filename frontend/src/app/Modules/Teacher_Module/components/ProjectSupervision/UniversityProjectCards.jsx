import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import { User , ChevronsLeft , ChevronsRight, Search, Filter } from "lucide-react";


const UniversityProjects = ({ theme }) => {
    const { user, isAuthLoading } = useAuth();
    const [isProjectsLoading, setIsProjectsLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [supervisionStatus, setSupervisionStatus] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            if (user && user.teacherDetails && user.teacherDetails.university) {
                setIsProjectsLoading(true); // Set loading state to true
                try {
                    // Fetch project details
                    const projectsResponse = await axios.get(
                        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getProjectsApprovedByYourUniWithDetails/${user.teacherDetails.university}`
                    );

                    setProjects(projectsResponse.data.projects);
                    setFilteredProjects(projectsResponse.data.projects);

                    // Fetch supervision status for all projects
                    const projectIds = projectsResponse.data.projects.map(project => project._id);
                    const statusResponse = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/bulkProjectSupervisionStatus`, {
                        projectIds,
                        email: user.email,
                        university: user.teacherDetails.university
                    });

                    const statusMap = statusResponse.data.statusMap.reduce((acc, { projectId, status }) => {
                        acc[projectId] = status;
                        return acc;
                    }, {});

                    setSupervisionStatus(statusMap);
                } catch (error) {
                    console.error("Error fetching projects:", error);
                } finally {
                    setIsProjectsLoading(false); // Set loading state to false
                }
            }
        };

        fetchProjects();
    }, [user]);

    useEffect(() => {
        filterProjects();
    }, [searchQuery, statusFilter, projects, supervisionStatus]);

    const filterProjects = () => {
        let filtered = projects.filter(project => {
            const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.projectType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.industryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.requiredSkills.some(skill => skill.toLowerCase().includes(searchQuery));

            const matchesStatus = statusFilter === "all" ||
                (statusFilter === "supervised_by_you" && supervisionStatus[project._id] === "supervised_by_you") ||
                (statusFilter === "approved_by_other" && supervisionStatus[project._id] === "approved_by_other") ||
                (statusFilter === "pending" && supervisionStatus[project._id] === "pending");

            return matchesSearch && matchesStatus;
        });

        setFilteredProjects(filtered);
        setCurrentPage(1); // Reset to the first page after filtering
    };

    const indexOfLastProject = currentPage * itemsPerPage;
    const indexOfFirstProject = indexOfLastProject - itemsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

    const getSupervisionStatusText = (projectId) => {
        const status = supervisionStatus[projectId];
        const project = projects.find(project => project._id === projectId);

        if (!project) {
            console.warn(`Project not found for projectId: ${projectId}`);
            return <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-sm">Project not found</span>;
        }

        if (status === "supervised_by_you") {
            return (
                <div className="flex items-center gap-2">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">Supervised by you</span>
                    {user.profilePic ? (
                        <img
                            src={user.profilePic}
                            alt={user.username}
                           className="w-6 h-6 rounded-full"
                        />
                    ) : (
                        <User className="w-8 h-8 text-gray-400 bg-gray-200 p-1 rounded-full mr-2" />
                    )}
                    {/* <img src={user.profilePic} alt={user.username} className="w-6 h-6 rounded-full" /> */}
                </div>
            );
        } else if (status === "approved_by_other") {
            return (
                <span className="bg-brand-500 text-white px-2 py-1 rounded-full text-sm">Supervised by someone else</span>
            );
        } else if (status === "pending") {
            return <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">Waiting for supervision</span>;
        } else {
            return <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-sm">Pending</span>;
        }
    };


    if (isAuthLoading) {
        return <Loading />;
    }

    if (!user) {
        return (
            <div className={`text-center ${theme === "dark" ? "text-red-400" : "text-red-500"}`}>
                You must be logged in to view your projects.
            </div>
        );
    }

    const Pagination = () => {
        const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
        const maxVisiblePages = 3;

        const generatePageNumbers = () => {
            if (totalPages <= maxVisiblePages + 4) {
                return Array.from({ length: totalPages }, (_, i) => i + 1);
            }

            if (currentPage <= maxVisiblePages) {
                return [...Array(maxVisiblePages).keys()].map(i => i + 1).concat(['...', totalPages - 2, totalPages - 1, totalPages]);
            }

            if (currentPage >= totalPages - maxVisiblePages + 1) {
                return [1, 2, 3, '...', ...Array.from({ length: maxVisiblePages }, (_, i) => totalPages - maxVisiblePages + i + 1)];
            }

            return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        };

        const pages = generatePageNumbers();

        return (
            <div className={`flex justify-end items-center gap-2 mt-8 ${theme === "dark" ? "text-white" : "text-black"}`}>
            <button
                onClick={() => setCurrentPage(prev => (prev > 1 ? prev - 1 : prev))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg transition-colors ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <ChevronsLeft className={`${theme === "dark" ? "text-gray-100" : "text-gray-590"}`} />
            </button>

            {pages.map((number, index) => (
                <button
                    key={index}
                    onClick={() => typeof number === 'number' && setCurrentPage(number)}
                    className={`px-4 py-2 rounded-lg transition-colors ${currentPage === number ? (theme === "dark" ? "bg-brand-600" : "bg-brand-500 text-white") : (theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300")} ${number === '...' ? "cursor-default" : ""}`}
                    disabled={number === '...'}
                >
                    {number}
                </button>
            ))}

            <button
                onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg transition-colors ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <ChevronsRight className={`${theme === "dark" ? "text-gray-100" : "text-gray-900"}`} />
            </button>
        </div>
        );
    };

    return (
        <div className={`p-6 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-accent-500 rounded-lg shadow-lg`}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Apply For Supervision of Any project</h2>

            <div className={`mb-8 flex items-center border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} rounded-lg p-2 shadow-sm`}>
                <Search className={`ml-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                <input
                    type="text"
                    placeholder="Search by title, skills, industry, type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full p-2 focus:outline-none ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}
                />
            </div>

            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <Filter className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`p-2 border rounded-lg focus:outline-none ${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"}`}
                    >
                        <option value="all">All</option>
                        <option value="supervised_by_you">Supervised by you</option>
                        <option value="approved_by_other">Approved by other</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Project List */}
            {isProjectsLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loading />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProjects.length === 0 ? (
                        <div className={`text-center col-span-full ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>No projects found.</div>
                    ) : (
                        currentProjects.map((project) => (
                            <div key={project._id}
                                className={`rounded-lg shadow-lg p-4 border cursor-pointer hover:shadow-xl transition h-full flex flex-col ${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"}`}
                                onClick={() => navigate(`/applySupervision/${project._id}`)}
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-lg">{project.title}</h3>
                                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{project.projectType}</span>
                                </div>

                                <p className={`text-sm mt-2 line-clamp-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                    {project.description}
                                </p>

                                <div className="flex-grow"></div>

                                <div className="flex justify-between items-center mt-4">
                                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                        <strong>Industry:</strong> {project.industryName}
                                    </p>
                                    {getSupervisionStatusText(project._id)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <Pagination />
        </div>
    );
};

UniversityProjects.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default UniversityProjects;
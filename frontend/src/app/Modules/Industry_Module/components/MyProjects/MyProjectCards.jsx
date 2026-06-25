import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import { ChevronsLeft, ChevronsRight, Search, SortAsc, SortDesc } from "lucide-react";

const MyProjectCards = ({ theme }) => {
    const { user, isAuthLoading } = useAuth();
    const [isProjectsLoading, setIsProjectsLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [sortOption, setSortOption] = useState("newest");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserAndProjects = async () => {
            if (user?.email) {
                fetchMyProjects(user.email);
            }
        };
        if (user) {
            fetchUserAndProjects();
        }
    }, [user]);

    const fetchMyProjects = async (currentUserId) => {
        setIsProjectsLoading(true); // Set loading state to true
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getMyProjects`, {
                params: { representativeId: currentUserId },
            });
            const sortedProjects = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setProjects(sortedProjects);
            setFilteredProjects(sortedProjects);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setIsProjectsLoading(false); // Set loading state to false
        }
    };

    useEffect(() => {
        setStatusFilter("all");
    }, []);

    useEffect(() => {
        let filtered = projects;

        // Filter by Status
        if (statusFilter !== "all") {
            filtered = filtered.filter(project => project.status === statusFilter);
        }

        // Filter by Search Query on Multiple Tags
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();

            filtered = filtered.filter(project =>
                project.title.toLowerCase().includes(query) ||
                project.description.toLowerCase().includes(query) ||
                project.additionalInfo.toLowerCase().includes(query) ||
                project.requiredSkills.some(skill => skill.toLowerCase().includes(query)) ||
                project.industryName.toLowerCase().includes(query) ||
                project.projectType.toLowerCase().includes(query)
            );
        }

        setFilteredProjects(filtered);
    }, [searchQuery, statusFilter, projects]);

    const handleSortChange = (option) => {
        setSortOption(option);

        let filtered = statusFilter === "all" ? [...projects] : projects.filter(p => p.status === statusFilter);

        if (option === "newest") {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        setFilteredProjects(filtered);
    };

    const isDurationExceeded = (endDate) => {
        if (!endDate) return false;
        const today = new Date();
        const projectEndDate = new Date(endDate);
        return today > projectEndDate;
    };

    const indexOfLastProject = currentPage * itemsPerPage;
    const indexOfFirstProject = indexOfLastProject - itemsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

    const Pagination = () => {
        const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
        const maxVisiblePages = 3; // How many numbers you want to show at once

        const generatePageNumbers = () => {
            if (totalPages <= maxVisiblePages + 4) {
                // Show all pages if total pages are small
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

    return (
        <div className={`p-6 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-accent-500 rounded-lg shadow-lg`}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">My Projects</h2>

            {/* Search Bar */}
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

            {/* Filters and Sorting */}
            <div className="flex flex-col sm:flex-row justify-start mb-6 gap-4">
                <div className="flex items-center gap-2">
                    {sortOption === "newest" ? (
                        <SortDesc className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                    ) : (
                        <SortAsc className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                    )}
                    <select
                        value={sortOption}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className={`p-2 border rounded-lg focus:outline-none ${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"}`}
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
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
                            <div
                                key={project._id}
                                className={`relative rounded-lg shadow-lg p-4 border cursor-pointer hover:shadow-xl transition-transform transform hover:scale-105 h-full flex flex-col ${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"}`}
                                onClick={() => navigate(`/project/${project._id}`)}
                            >

                                {/* Add the exceeded tag at the top of the card, before other content */}
                                {isDurationExceeded(project.duration?.endDate) && (
                                    <div className="absolute top-0 right-0 transform translate-y-[-50%] translate-x-[20%]">
                                        <span className={`text-xs px-2 py-1 rounded-full ${theme === "dark" ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"}`}>
                                            End Date Exceeded
                                        </span>
                                    </div>
                                )}


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
                                </div>

                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Pagination */}
            <Pagination />
        </div>
    );
};

MyProjectCards.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default MyProjectCards;
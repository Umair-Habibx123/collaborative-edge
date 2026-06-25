import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import { User, ChevronsLeft, ChevronsRight, Search, SortDesc, SortAsc } from "lucide-react";

const AvailableProjects = ({ theme }) => {
    const { user, isAuthLoading } = useAuth();
    const [projects, setProjects] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [sortOption, setSortOption] = useState("newest");
    const [filterOption, setFilterOption] = useState("all"); // New state for filter option
    const [isProjectsLoading, setIsProjectsLoading] = useState(false);
    const [selectionDetails, setSelectionDetails] = useState({});
    const navigate = useNavigate();

    const fetchProjectsWithGroupMembersAndSelectionDetails = async () => {
        if (user && user.email) {
            setIsProjectsLoading(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/fetchProjectsWithGroupMembersAndSelectionDetails`,
                    {
                        params: {
                            userEmail: user.email,
                        },
                    }
                );

                const projectsWithAllDetails = response.data.projects;

                // Sort projects
                const sortedProjects = projectsWithAllDetails.sort((a, b) => {
                    // Find when user joined each project
                    const userJoinedDateA = a.selectionDetails?.joinedAt;
                    const userJoinedDateB = b.selectionDetails?.joinedAt;

                    return sortOption === "newest"
                        ? new Date(userJoinedDateB) - new Date(userJoinedDateA)
                        : new Date(userJoinedDateA) - new Date(userJoinedDateB);
                });

                setProjects(sortedProjects);
                setFilteredProjects(sortedProjects);

                // Convert selection details to the format expected by your existing code
                const details = {};
                sortedProjects.forEach(project => {
                    if (project.selectionDetails) {
                        details[project._id] = {
                            _id: project._id,
                            studentSelection: [project.selectionDetails]
                        };
                    }
                });
                setSelectionDetails(details);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setIsProjectsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchProjectsWithGroupMembersAndSelectionDetails();
    }, [user, sortOption]);

    useEffect(() => {
        let filtered = projects;

        // Apply search filter
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

        // Apply status filter
        if (filterOption !== "all") {
            filtered = filtered.filter(project => {
                const projectSelection = selectionDetails[project._id]?.studentSelection?.[0];
                const isCompleted = projectSelection?.isCompleted || false;
                return filterOption === "completed" ? isCompleted : !isCompleted;
            });
        }

        setFilteredProjects(filtered);
    }, [searchQuery, projects, filterOption, selectionDetails]);

    const handleSortChange = (option) => {
        setSortOption(option);

        let filtered = [...projects];

        if (option === "newest") {
            filtered.sort((a, b) => {
                const userJoinedDateA = a.groupMembers.find(member => member.email === user.email)?.joinedAt;
                const userJoinedDateB = b.groupMembers.find(member => member.email === user.email)?.joinedAt;
                return new Date(userJoinedDateB) - new Date(userJoinedDateA);
            });
        } else {
            filtered.sort((a, b) => {
                const userJoinedDateA = a.groupMembers.find(member => member.email === user.email)?.joinedAt;
                const userJoinedDateB = b.groupMembers.find(member => member.email === user.email)?.joinedAt;
                return new Date(userJoinedDateA) - new Date(userJoinedDateB);
            });
        }

        setFilteredProjects(filtered);
    };

    const handleFilterChange = (option) => {
        setFilterOption(option);
        setCurrentPage(1); // Reset to first page when filter changes
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

    if (isAuthLoading) {
        return <Loading />;
    }

    return (
        <div className={`p-6 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-accent-500 rounded-lg shadow-lg`}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">View Project Submissions</h2>

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

            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
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

                {/* New Filter Dropdown */}
                <div className="flex items-center gap-2">
                    <select
                        value={filterOption}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className={`p-2 border rounded-lg focus:outline-none ${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"}`}
                    >
                        <option value="all">All Projects</option>
                        <option value="completed">Completed</option>
                        <option value="in-progress">In Progress</option>
                    </select>
                </div>
            </div>

            {isProjectsLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loading />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProjects.length === 0 ? (
                        <div className={`text-center col-span-full ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>No projects found.</div>
                    ) : (
                        currentProjects.map((project) => {
                            const projectSelection = selectionDetails[project._id]?.studentSelection?.[0];
                            const isCompleted = projectSelection?.isCompleted || false;

                            return (
                                 <div
                                    key={project._id}
                                    className={`relative rounded-lg shadow-lg p-4 border cursor-pointer hover:shadow-xl transition-transform transform hover:scale-105 h-full flex flex-col ${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"}`}
                                    onClick={() => navigate(`/project-submissions/${project._id}`)}
                                >

                                       {/* Add the exceeded tag */}
                                      {isDurationExceeded(project.duration?.endDate) && !isCompleted &&(
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

                                        {project.studentDetails && (
                                            <div className="flex items-center">
                                                {project.studentDetails.profilePic ? (
                                                    <img
                                                        src={project.studentDetails.profilePic}
                                                        alt={project.studentDetails.username}
                                                        className="w-8 h-8 rounded-full mr-2"
                                                    />
                                                ) : (
                                                    <User className="w-8 h-8 text-gray-400 bg-gray-200 p-1 rounded-full mr-2" />
                                                )}
                                                <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                                    {project.studentDetails.username}
                                                </span>
                                            </div>
                                        )}
                                    </div>



                                    {/* Display Group Members */}
                                    {project.groupMembers && project.groupMembers.length > 0 && (
                                        <div className="mt-2">
                                            <div className="flex justify-end -space-x-3 mt-2">
                                                {project.groupMembers
                                                    .filter((member) => member.email === user.email)
                                                    .map((member, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative w-8 h-8 rounded-full border-2 border-white"
                                                            style={{ zIndex: project.groupMembers.length + 1 }}
                                                        >
                                                            {member.profilePic ? (
                                                                <img
                                                                    src={`${member.profilePic}?w=20&q=10`}
                                                                    alt={member.username}
                                                                    className="w-full h-full rounded-full object-cover blur-sm"
                                                                    loading="lazy"
                                                                    onLoad={(e) => {
                                                                        e.target.src = `${member.profilePic}?w=80&q=80`;
                                                                        e.target.classList.remove("blur-sm");
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                                                                    <User className="w-5 h-5 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}

                                                {project.groupMembers
                                                    .filter((member) => member.email !== user.email)
                                                    .map((member, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative w-8 h-8 rounded-full border-2 border-white"
                                                            style={{ zIndex: project.groupMembers.length - index }}
                                                        >
                                                            {member.profilePic ? (
                                                                <img
                                                                    src={`${member.profilePic}?w=20&q=10`}
                                                                    alt={member.username}
                                                                    className="w-full h-full rounded-full object-cover blur-sm"
                                                                    loading="lazy"
                                                                    onLoad={(e) => {
                                                                        e.target.src = `${member.profilePic}?w=80&q=80`;
                                                                        e.target.classList.remove("blur-sm");
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                                                                    <User className="w-5 h-5 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                                Project Status
                                            </span>
                                            <span className={`text-xs font-medium ${isCompleted ? (theme === "dark" ? "text-green-400" : "text-green-600") : (theme === "dark" ? "text-yellow-400" : "text-yellow-600")}`}>
                                                {isCompleted ? "Completed" : "In Progress"}
                                            </span>
                                        </div>
                                        <div className={`w-full h-2 rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                                            <div
                                                className={`h-full rounded-full ${isCompleted ? (theme === "dark" ? "bg-green-500" : "bg-green-400") : (theme === "dark" ? "bg-yellow-500" : "bg-yellow-400")}`}
                                                style={{ width: isCompleted ? '100%' : '50%' }}
                                            ></div>
                                        </div>
                                        {projectSelection?.completedAt && (
                                            <div className={`text-xs mt-1 text-right ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                                Completed on: {new Date(projectSelection.completedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            <Pagination />
        </div>
    );
};

AvailableProjects.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default AvailableProjects;
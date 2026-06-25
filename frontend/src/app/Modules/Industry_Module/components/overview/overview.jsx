import PropTypes from "prop-types";
import ProjectsBySkillsChart from "./Charts/ProjectsBySkillsChart";
import UniversityEngagementChart from "./Charts/UniversityEngagementChart";
import ProjectStatusChart from "./Charts/ProjectStatusChart";
import ProjectsTimelineChart from "./Charts/ProjectTimeLineChart";
import { useAuth } from "../../../../../auth/AuthContext"
import { useState, useEffect } from "react";
import {
    Layers,
    BarChart2,
    Users,
    Activity,
    LayoutDashboard,
    ArrowRight,
    Building2,
    Radar,
    GanttChartSquare,
    LineChart,
    Trophy,
    CheckCircle,
    TrendingUp,
    BookOpen,
    Building,
    BookUserIcon,
    ThumbsUpIcon,
    University
} from "lucide-react";
import Loading from "../../../../Components/loadingIndicator/loading";

const Overview = ({ theme }) => {
    const [projectsBySkillsData, setProjectsBySkillsData] = useState(null);
    const [universityEngagementData, setUniversityEngagementData] = useState(null);
    const [projectStatusData, setProjectStatusData] = useState(null);
    const [projectsTimelineData, setProjectsTimelineData] = useState(null);
    const { user, isAuthLoading } = useAuth();
    const [approvedCount, setSpprovedCount] = useState(0);
    const [projectCounts, setProjectCounts] = useState(0);
    const [topUniversity, setTopUniversity] = useState(null);
    const [loading, isLoading] = useState(false);


    useEffect(() => {
        const fetchAllData = async () => {
            try {
                isLoading(true);

                const [skillsRes, engagementRes, statusRes, timelineRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/RepProjects/skills/${user.email}`),
                    fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/RepProjects/engagement/${user.email}`),
                    fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/RepProjects/status/${user.email}`),
                    fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/RepProjects/timeline/${user.email}`)
                ]);

                // Check for errors
                if (!skillsRes.ok) throw new Error('Failed to fetch RepProjects by skills');
                if (!engagementRes.ok) throw new Error('Failed to fetch university engagement');
                if (!statusRes.ok) throw new Error('Failed to fetch RepProjects status');
                if (!timelineRes.ok) throw new Error('Failed to fetch RepProjects timeline');

                // Parse all responses
                const [skillsData, engagementData, statusData, timelineData] = await Promise.all([
                    // skillsdunny,
                    skillsRes.json(),
                    engagementRes.json(),
                    statusRes.json(),
                    timelineRes.json()
                ]);

                const approvedItem = statusData.find(item => item.status === "approved");
                const approvedCount = approvedItem ? approvedItem.count : 0;
                setSpprovedCount(approvedCount);

                const now = new Date();
                const currentMonth = now.getMonth(); // 0 = Jan, 1 = Feb, ..., 4 = May
                const currentYear = now.getFullYear();

                const projectsThisMonth = timelineData.filter(item => {
                    const createdDate = new Date(item.createdAt);
                    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
                });

                const projectCountThisMonth = projectsThisMonth.length;
                setProjectCounts(projectCountThisMonth);


                // Safely find top university with fallback
                const topUniversity = engagementData.length > 0
                    ? engagementData.reduce((top, current) => {
                        return current.engagementScore > top.engagementScore ? current : top;
                    }, engagementData[0]) // Provide initial value
                    : null; // Or some default value

                setTopUniversity(topUniversity?.university || "No data"); // Provide fallback

                // Set all states
                setProjectsBySkillsData(skillsData);
                setUniversityEngagementData(engagementData);
                setProjectStatusData(statusData);
                setProjectsTimelineData(timelineData);
            } catch (error) {
                isLoading(false);

                console.error("Error fetching data:", error);
                // Consider setting error state here
            }
            finally {
                isLoading(false);

            }
        };

        fetchAllData();
    }, [user.email]);


    if (isAuthLoading || loading) {
        return <Loading />;
    }

    return (
        <div className={`p-4 md:p-6 rounded-2xl w-full ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"} shadow-sm`}>
            {/* Dashboard Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-brand-100/80"} shadow`}>
                        <LayoutDashboard className="w-6 h-6 text-brand-600" strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
                            Industry Dashboard
                        </h2>
                        <p className={`text-sm flex items-center gap-2 mt-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            <Activity className="w-4 h-4" strokeWidth={2} />
                            Comprehensive overview of project metrics and engagement
                        </p>
                    </div>
                </div>
            </div>


            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm flex items-center gap-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                <Users className="w-4 h-4 text-brand-500" />
                                Total Approvals
                            </p>
                            <h3 className="text-2xl font-bold mt-2">
                                {approvedCount}
                            </h3>
                            <div className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} flex items-center gap-1`}>
                                <TrendingUp className="w-3 h-3" />
                                Approval Traffic
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700/50 group-hover:bg-gray-700" : "bg-white group-hover:bg-brand-50"} transition-colors`}>
                            <Users className="w-6 h-6 text-brand-500" />
                        </div>
                    </div>
                </div>

                {/* Completion Rate */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm flex items-center gap-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                <Building className="w-4 h-4 text-green-500" />
                                Projects Uploaded this month
                            </p>
                            <h3 className="text-2xl font-bold mt-2">
                                {projectCounts || 0}
                            </h3>
                            <div className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} flex items-center gap-1`}>
                                <TrendingUp className="w-3 h-3" />
                                Projects Uploaded this month
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700/50 group-hover:bg-gray-700" : "bg-white group-hover:bg-green-50"} transition-colors`}>
                            <BookUserIcon className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Average Rating */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm flex items-center gap-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                <ThumbsUpIcon className="w-4 h-4 text-yellow-500" />
                                Top University Engagement
                            </p>
                            <h3 className="text-2xl font-bold mt-2">
                                {topUniversity || 0}
                            </h3>
                            <div className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} flex items-center gap-1`}>
                                <TrendingUp className="w-3 h-3" />
                                Top University Engagement
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700/50 group-hover:bg-gray-700" : "bg-white group-hover:bg-yellow-50"} transition-colors`}>
                            <University className="w-6 h-6 text-yellow-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Charts - 2 column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Status Chart */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-green-100/80"} shadow`}>
                                <Layers className="w-5 h-5 text-green-600" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Project Status</h3>
                                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    Distribution across project statuses
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${theme === "dark" ? "bg-gray-700 text-green-400" : "bg-green-100 text-green-700"} shadow-sm`}>
                            Status Overview
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ProjectStatusChart
                            data={projectStatusData}
                            theme={theme}
                        />
                    </div>
                    <div className={`flex items-center justify-between mt-4 px-4 py-2.5 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} transition-colors group-hover:${theme === "dark" ? "bg-gray-700/90" : "bg-gray-100"}`}>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={2} />
                            <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                Projects tracked
                            </span>
                        </div>
                        <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {projectStatusData?.length || 0} statuses
                        </span>
                    </div>
                </div>

                {/* Projects Timeline Chart */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-brand-100/80"} shadow`}>
                                <Building2 className="w-5 h-5 text-brand-600" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Projects Timeline</h3>
                                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    Monthly project creation trend
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${theme === "dark" ? "bg-gray-700 text-brand-400" : "bg-brand-100 text-brand-700"} shadow-sm`}>
                            Time Series
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ProjectsTimelineChart
                            data={projectsTimelineData}
                            theme={theme}
                        />
                    </div>
                    <div className={`flex items-center justify-between mt-4 px-4 py-2.5 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} transition-colors group-hover:${theme === "dark" ? "bg-gray-700/90" : "bg-gray-100"}`}>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-brand-500" strokeWidth={2} />
                            <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                Project growth trend
                            </span>
                        </div>
                        <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {projectsTimelineData?.length || 0} time periods
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Charts - Full width */}
            <div className="mt-6 grid grid-cols-1 gap-6">
                {/* Projects by Skills Chart */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-brand-100/80"} shadow`}>
                                <Radar className="w-5 h-5 text-brand-600" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Projects by Required Skills</h3>
                                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    Distribution of skills required across projects
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${theme === "dark" ? "bg-gray-700 text-brand-400" : "bg-brand-100 text-brand-700"} shadow-sm`}>
                            Skills Analysis
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ProjectsBySkillsChart
                            data={projectsBySkillsData}
                            theme={theme}
                        />
                    </div>
                    <div className={`flex items-center justify-between mt-4 px-4 py-2.5 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} transition-colors group-hover:${theme === "dark" ? "bg-gray-700/90" : "bg-gray-100"}`}>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-brand-500" strokeWidth={2} />
                            <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                Top in-demand skills
                            </span>
                        </div>
                        <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {projectsBySkillsData?.length || 0} skills tracked
                        </span>
                    </div>
                </div>

                {/* University Engagement Chart */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-brand-100/80"} shadow`}>
                                <BarChart2 className="w-5 h-5 text-brand-600" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">University Engagement</h3>
                                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    Breakdown of projects by university
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${theme === "dark" ? "bg-gray-700 text-brand-400" : "bg-brand-100 text-brand-700"} shadow-sm`}>
                            Engagement Metrics
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <UniversityEngagementChart
                            data={universityEngagementData}
                            theme={theme}
                        />
                    </div>
                    <div className={`flex items-center justify-between mt-4 px-4 py-2.5 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} transition-colors group-hover:${theme === "dark" ? "bg-gray-700/90" : "bg-gray-100"}`}>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-brand-500" strokeWidth={2} />
                            <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                University partners
                            </span>
                        </div>
                        <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {universityEngagementData?.length || 0} institutions
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className={`mt-8 pt-5 border-t ${theme === "dark" ? "border-gray-800" : "border-gray-300"}`}>
                <div className="flex justify-center">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-3xl px-4">
                        <div className={`flex items-center gap-2 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            <GanttChartSquare className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                            <span className="whitespace-nowrap">
                                Last updated: <span className="font-medium">{new Date().toLocaleString()}</span>
                            </span>
                        </div>

                        <div className={`flex items-center gap-2 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            <ArrowRight className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                            <span className="hidden sm:inline-flex">Real-time monitoring dashboard</span>
                            <span className="inline-flex sm:hidden">Live dashboard</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

Overview.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default Overview;
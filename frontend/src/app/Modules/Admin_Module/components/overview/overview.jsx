import PropTypes from "prop-types";
import UserChart from "./Charts/TotalUsers";
import RolePieChart from "./Charts/RolePieChart";
import ProjectChart from "./Charts/ProjectChart";
import { useState, useEffect } from "react";
import {
    RefreshCw,
    Layers,
    PieChart,
    Users,
    Activity,
    LayoutDashboard,
    ArrowRight,
    Building2,
    UserCog,
    LineChart,
    GanttChartSquare,
    BarChart3,
    Trophy,
    TrendingUp,
    CircleDollarSign,
    Users2,
    Building,
    BookUserIcon,
    ThumbsUpIcon,
    University
} from "lucide-react";
import Loading from "../../../../Components/loadingIndicator/loading";

const Overview = ({ theme }) => {
    const [userChartData, setUserChartData] = useState(null);
    const [roleData, setRoleData] = useState(null);
    // const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [availableYears, setAvailableYears] = useState([]);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [chartType, setChartType] = useState("year");
    const [projectTypeData, setProjectTypeData] = useState(null);
    const [projectIndustryData, setProjectIndustryData] = useState(null);
    const [projectRepData, setProjectRepData] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalIndustry, setTotalIndustry] = useState(0);
    const [totalTypes, setTotalTypes] = useState(0);

    const [loading, isLoading] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                isLoading(true);

                const fetchYearlyData = async () => {
                    const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/yearly`);
                    const data = await res.json();
                    const sortedData = data.sort((a, b) => a._id.year - b._id.year);
                    setUserChartData(sortedData);
                    setTotalUsers(sortedData.reduce((sum, item) => sum + item.count, 0));
                    const years = sortedData.map(item => item._id.year);
                    setAvailableYears(years);
                    if (years.length > 0) setSelectedYear(Math.max(...years));
                };

                const fetchMonthlyData = async () => {
                    if (!selectedYear) return;
                    const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/monthly/${selectedYear}`);
                    const data = await res.json();
                    const sortedData = data.sort((a, b) => a._id.month - b._id.month);
                    setUserChartData(sortedData);
                    setAvailableMonths(sortedData.map(item => item._id.month));
                    setChartType("month");
                };

                const fetchWeeklyData = async () => {
                    if (!selectedYear || !selectedMonth) return;
                    const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/weekly/${selectedYear}/${selectedMonth}`);
                    const data = await res.json();
                    setUserChartData(data.sort((a, b) => a._id.week - b._id.week));
                    setChartType("week");
                };

                const fetchRoleData = async () => {
                    const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/roles`);
                    setRoleData(await res.json());
                };

                const fetchProjectData = async () => {
                    const [typeRes, industryRes, repRes] = await Promise.all([
                        fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/projects/types`),
                        fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/projects/industries`),
                        fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/projects/representatives`)
                    ]);

                    const [typeData, industryData, repData] = await Promise.all([
                        typeRes.json(),
                        industryRes.json(),
                        repRes.json()
                    ]);

                    setTotalIndustry(new Set(industryData.map(item => item._id)).size);
                    setTotalTypes(new Set(typeData.map(item => item._id)).size);
                    setProjectTypeData(typeData);
                    setProjectIndustryData(industryData);
                    setProjectRepData(repData);
                };

                await Promise.all([
                    fetchYearlyData(),
                    fetchRoleData(),
                    fetchProjectData()
                ]);

                await fetchMonthlyData();
                await fetchWeeklyData();

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                isLoading(false);
            }
        };

        fetchAllData();
    }, [selectedYear, selectedMonth]);

    const handleReset = () => {
        setSelectedYear("");
        setSelectedMonth("");
        setAvailableMonths([]);
        setChartType("year");

        const fetchYearlyData = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/yearly`);
                const data = await res.json();
                const sortedData = data.sort((a, b) => a._id.year - b._id.year);
                setUserChartData(sortedData);
            } catch (error) {
                console.error("Error fetching yearly data:", error);
            }
        };
        fetchYearlyData();
    };


    if (loading) {
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
                            Admin Analytics Dashboard
                        </h2>
                        <p className={`text-sm flex items-center gap-2 mt-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            <Activity className="w-4 h-4" strokeWidth={2} />
                            Comprehensive overview of system metrics and user activity
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
                                Total Users
                            </p>
                            <h3 className="text-2xl font-bold mt-2">
                                {totalUsers || 0}
                            </h3>
                            <div className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} flex items-center gap-1`}>
                                <TrendingUp className="w-3 h-3" />
                                Users Traffic
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700/50 group-hover:bg-gray-700" : "bg-white group-hover:bg-brand-50"} transition-colors`}>
                            <Users2 className="w-6 h-6 text-brand-500" />
                        </div>
                    </div>
                </div>

                {/* Completion Rate */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm flex items-center gap-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                <Building className="w-4 h-4 text-green-500" />
                                Total Unique Industries
                            </p>
                            <h3 className="text-2xl font-bold mt-2">
                                {totalIndustry || 0}
                            </h3>
                            <div className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} flex items-center gap-1`}>
                                <TrendingUp className="w-3 h-3" />
                                Unique Industries Representaions
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
                                Total Unique Types of Projects
                            </p>
                            <h3 className="text-2xl font-bold mt-2">
                                {totalTypes || 0}
                            </h3>
                            <div className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} flex items-center gap-1`}>
                                <TrendingUp className="w-3 h-3" />
                                Unique Projects Types
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700/50 group-hover:bg-gray-700" : "bg-white group-hover:bg-yellow-50"} transition-colors`}>
                            <University className="w-6 h-6 text-yellow-500" />
                        </div>
                    </div>
                </div>
            </div>


            {/* Chart Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Chart - 2/3 Width */}
                <div className={`lg:col-span-2 p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-brand-100/80"} shadow`}>
                                <LineChart className="w-5 h-5 text-brand-600" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {chartType === "year" ? "Annual User Growth"
                                        : chartType === "month" ? `Monthly Users (${selectedYear})`
                                            : `Weekly Users (${selectedYear}-${selectedMonth})`}
                                </h3>
                                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    {chartType === "year" ? "Total users per year"
                                        : chartType === "month" ? "Monthly user acquisition"
                                            : "Weekly user activity"}
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${theme === "dark" ? "bg-gray-700 text-brand-400" : "bg-brand-100 text-brand-700"} shadow-sm`}>
                            {chartType === "year" ? "Annual Trend"
                                : chartType === "month" ? "Monthly View"
                                    : "Weekly Breakdown"}
                        </div>
                    </div>
                    <div className="flex gap-2 mb-2">
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                setSelectedMonth("");
                            }}
                            className={`text-xs p-1.5 rounded-md ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-800 border"} shadow-sm`}
                        >
                            <option value="" disabled>Select Year</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}


                            className={`text-xs p-1.5 rounded-md ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-800 border"} shadow-sm`}
                        >
                            <option value="" disabled>Select Month</option>
                            {availableMonths.map(month => (
                                <option key={month} value={month}>
                                    {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleReset}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95"
                        >
                            <RefreshCw className="w-4 h-4" strokeWidth={2} />
                            Reset Filters
                        </button>

                    </div>
                    <div className="h-[350px]">
                        <UserChart
                            data={userChartData}
                            xAxisType={chartType}
                            theme={theme}
                        />
                    </div>
                    <div className={`flex items-center justify-between mt-4 px-4 py-2.5 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} transition-colors group-hover:${theme === "dark" ? "bg-gray-700/90" : "bg-gray-100"}`}>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-brand-500" strokeWidth={2} />
                            <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                {chartType === "year" ? "Year-over-year growth"
                                    : chartType === "month" ? "Month-over-month"
                                        : "Week-over-week"}
                            </span>
                        </div>
                        <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {userChartData?.length || 0} {chartType === "year" ? "years" : chartType === "month" ? "months" : "weeks"}
                        </span>
                    </div>
                </div>

                {/* Role Pie Chart - 1/3 Width */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-brand-100/80"} shadow`}>
                                <PieChart className="w-5 h-5 text-brand-600" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">User Role Distribution</h3>
                                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Breakdown of users by their roles</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${theme === "dark" ? "bg-gray-700 text-brand-400" : "bg-brand-100 text-brand-700"} shadow-sm`}>
                            Role Metrics
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <RolePieChart data={roleData} theme={theme} />
                    </div>
                    <div className={`flex items-center justify-between mt-4 px-4 py-2.5 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} transition-colors group-hover:${theme === "dark" ? "bg-gray-700/90" : "bg-gray-100"}`}>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-brand-500" strokeWidth={2} />
                            <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                Total roles
                            </span>
                        </div>
                        <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {roleData?.length || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Project Charts Section */}
            <div className="mt-6 grid grid-cols-1 gap-6">
                {/* First Row - Two Half-Width Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Project Type Chart */}
                    <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-green-100/80"} shadow`}>
                                    <Layers className="w-5 h-5 text-green-600" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Project Types</h3>
                                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                        Distribution across project categories
                                    </p>
                                </div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${theme === "dark" ? "bg-gray-700 text-green-400" : "bg-green-100 text-green-700"} shadow-sm`}>
                                Categories
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <ProjectChart
                                data={projectTypeData}
                                theme={theme}
                                initialChartType={"bar"}

                            />
                        </div>
                        <div className={`flex items-center justify-between mt-4 px-4 py-2.5 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} transition-colors group-hover:${theme === "dark" ? "bg-gray-700/90" : "bg-gray-100"}`}>
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-green-500" strokeWidth={2} />
                                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                    Project categories
                                </span>
                            </div>
                            <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                {projectTypeData?.length || 0}
                            </span>
                        </div>
                    </div>

                    {/* Project Industry Chart */}
                    <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-brand-100/80"} shadow`}>
                                    <Building2 className="w-5 h-5 text-brand-600" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Projects by Industry</h3>
                                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                        Industry-specific project distribution
                                    </p>
                                </div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${theme === "dark" ? "bg-gray-700 text-brand-400" : "bg-brand-100 text-brand-700"} shadow-sm`}>
                                Industries
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <ProjectChart
                                data={projectIndustryData}
                                theme={theme}
                                initialChartType={"line"}

                            />
                        </div>
                        <div className={`flex items-center justify-between mt-4 px-4 py-2.5 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} transition-colors group-hover:${theme === "dark" ? "bg-gray-700/90" : "bg-gray-100"}`}>
                            <div className="flex items-center gap-2">
                                <CircleDollarSign className="w-4 h-4 text-brand-500" strokeWidth={2} />
                                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                    Industry sectors
                                </span>
                            </div>
                            <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                {projectIndustryData?.length || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Top Representatives Chart */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-orange-100/80"} shadow`}>
                                <UserCog className="w-5 h-5 text-orange-600" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Top Representatives</h3>
                                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    Performance metrics by representative
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${theme === "dark" ? "bg-gray-700 text-orange-400" : "bg-orange-100 text-orange-700"} shadow-sm`}>
                            Performance
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ProjectChart
                            data={projectRepData}
                            theme={theme}
                            initialChartType={"bar"}
                        />
                    </div>
                    <div className={`flex items-center justify-between mt-4 px-4 py-2.5 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} transition-colors group-hover:${theme === "dark" ? "bg-gray-700/90" : "bg-gray-100"}`}>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-orange-500" strokeWidth={2} />
                            <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                Sorted by project count
                            </span>
                        </div>
                        <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {projectRepData?.length || 0} representatives
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
        </div >
    );
};



Overview.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default Overview;
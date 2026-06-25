import PropTypes from "prop-types";
import TeacherStatsChart from "./Charts/TeacherStatsChart";
import UniversityStatsChart from "./Charts/UniversityStatsChart";
import { useAuth } from "../../../../../auth/AuthContext"
import { useState, useEffect } from "react";
import {
    Star,
    Activity,
    LayoutDashboard,
    ArrowRight,
    Radar,
    GanttChartSquare,
    PieChart,
    BarChart2,
    Grid,
    Trophy,
    CheckCircle,
    TrendingUp,
    BookOpen,
    Users
} from "lucide-react";
import Loading from "../../../../Components/loadingIndicator/loading";


const Overview = ({ theme }) => {
    const [studentCompletionData, setStudentCompletionData] = useState(null);
    const [studentRatingData, setStudentRatingData] = useState(null);
    const { user, isAuthLoading } = useAuth();
    const [totalSupervising, setTotalSupervising] = useState(0);
    const [topteacher, setTopteacher] = useState(null);
    const [rate, setRate] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [loading, isLoading] = useState(false);


    useEffect(() => {
        const fetchAllData = async () => {

            try {
                isLoading(true);

                const [studentcomp, studentrat] = await Promise.all([
                    fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/teacher/TeacherStats/${user.email}`),
                    fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/teacher/UniversityStats/${user.teacherDetails.university}`),
                ]);

                if (!studentcomp.ok) throw new Error('Failed to fetch student completion data');
                if (!studentrat.ok) throw new Error('Failed to fetch student ratings');

                const [student1, student2] = await Promise.all([
                    studentcomp.json(),
                    studentrat.json()
                ]);

                setStudentCompletionData(student1);
                setStudentRatingData(student2);


                const totalSupervising = student1.supervisionStats.total;
                setTotalSupervising(totalSupervising);

                const completionRate = student1.groupStats.completionRate;
                setRate(completionRate);
                const completion = student1.groupStats.completed;
                setCompleted(completion);


                const topTeacher = student2.topTeachers[0]?.teacherName;
                setTopteacher(topTeacher);


            } catch (error) {
                isLoading(false);

                console.error("Error fetching data:", error);
            }
            finally {
                isLoading(false);

            }
        };

        fetchAllData();
    }, [user.email, user.teacherDetails.university]);


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
                            Teacher Dashboard
                        </h2>
                        <p className={`text-sm flex items-center gap-2 mt-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            <Activity className="w-4 h-4" strokeWidth={2} />
                            Comprehensive overview of teaching metrics and university engagement
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* Total Projects */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm flex items-center gap-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                <Grid className="w-4 h-4 text-brand-500" />
                                Total Supervisied Projects
                            </p>
                            <h3 className="text-2xl font-bold mt-2">
                                {totalSupervising || 0}
                            </h3>
                            <div className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} flex items-center gap-1`}>
                                <TrendingUp className="w-3 h-3" />
                                All supervised projects
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700/50 group-hover:bg-gray-700" : "bg-white group-hover:bg-brand-50"} transition-colors`}>
                            <Trophy className="w-6 h-6 text-brand-500" />
                        </div>
                    </div>
                </div>

                {/* Completion Rate */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm flex items-center gap-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                <PieChart className="w-4 h-4 text-green-500" />
                                Completion Rate
                            </p>
                            <h3 className="text-2xl font-bold mt-2">
                                {rate ? `${rate}%` : '0%'}
                            </h3>
                            <div className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} flex items-center gap-1`}>
                                <CheckCircle className="w-3 h-3" />
                                {completed} completed
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700/50 group-hover:bg-gray-700" : "bg-white group-hover:bg-green-50"} transition-colors`}>
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Average Rating */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm flex items-center gap-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                <Star className="w-4 h-4 text-yellow-500" />
                                Top Teacher
                            </p>
                            <h3 className="text-2xl font-bold mt-2">
                                {topteacher || 'N/A'}
                            </h3>
                            <div className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} flex items-center gap-1`}>
                                <TrendingUp className="w-3 h-3" />
                                Based on all evaluations
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700/50 group-hover:bg-gray-700" : "bg-white group-hover:bg-yellow-50"} transition-colors`}>
                            <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Teacher Stats Chart */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-brand-100/80"} shadow`}>
                                <Radar className="w-5 h-5 text-brand-600" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Project Analytics
                                </h3>
                                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    Distribution and completion status
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${theme === "dark" ? "bg-gray-700 text-brand-400" : "bg-brand-100 text-brand-700"} shadow-sm`}>
                            Interactive
                        </div>
                    </div>
                    <div className="min-h-[350px]">

                        <TeacherStatsChart
                            data={studentCompletionData}
                            theme={theme}
                        />
                    </div>
                </div>

                {/* University Stats Chart */}
                <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-brand-100/80"} shadow`}>
                                <BarChart2 className="w-5 h-5 text-brand-600" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">University Performance</h3>
                                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    Detailed university-wide metrics
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${theme === "dark" ? "bg-gray-700 text-brand-400" : "bg-brand-100 text-brand-700"} shadow-sm`}>
                            Multi-view
                        </div>
                    </div>
                    <div className="min-h-[350px]">
                        <UniversityStatsChart data={studentRatingData} theme={theme} />
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
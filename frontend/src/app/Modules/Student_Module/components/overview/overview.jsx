import PropTypes from "prop-types";
import StudentCompletionChart from "./Charts/StudentCompletionChart";
import StudentRatingsChart from "./Charts/StudentRatingsChart";
import { useAuth } from "../../../../../auth/AuthContext";
import {
    Star,
    Activity,
    LayoutDashboard,
    ArrowRight,
    Radar,
    GanttChartSquare,
    BarChart2,
    Grid,
    Trophy,
    PieChart,
    CheckCircle,
} from "lucide-react";
import Loading from "../../../../Components/loadingIndicator/loading";
import { Card, Badge, StatCard, GradientText } from "../../../../ui/index.js";
import { useParallelData } from "../../../../../lib/useParallelData.js";

const Overview = ({ theme }) => {
    const { user, isAuthLoading } = useAuth();

    // Both metrics endpoints fetched in parallel (Promise.all) and aborted on
    // unmount via the shared hook — total latency ≈ the slowest single request.
    const { data, loading } = useParallelData(
        {
            completion: `/student/SelectionCompletion/${user?.email}`,
            ratings: `/student/StudentRatings/${user?.email}`,
        },
        [user?.email],
        { enabled: Boolean(user?.email) }
    );

    if (isAuthLoading || loading) return <Loading />;

    const studentCompletionData = data?.completion;
    const studentRatingData = data?.ratings;

    return (
        <div className="w-full rounded-2xl bg-white p-4 text-slate-900 shadow-sm md:p-6 dark:bg-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <div className="rounded-xl bg-gradient-brand p-3 shadow-glow">
                    <LayoutDashboard className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <div>
                    <GradientText as="h2" className="text-2xl md:text-3xl">
                        Student Dashboard
                    </GradientText>
                    <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Activity className="h-4 w-4" strokeWidth={2} />
                        Comprehensive overview of project metrics and engagement
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                <StatCard
                    label="Total Projects"
                    labelIcon={Grid}
                    value={studentCompletionData?.stats?.total || 0}
                    hint="All assigned projects"
                    icon={Trophy}
                    accent="brand"
                />
                <StatCard
                    label="Completion Rate"
                    labelIcon={PieChart}
                    value={
                        studentCompletionData?.stats?.completionRate
                            ? `${studentCompletionData.stats.completionRate}%`
                            : "0%"
                    }
                    hint={`${studentCompletionData?.stats?.completed || 0} completed`}
                    icon={CheckCircle}
                    accent="green"
                />
                <StatCard
                    label="Average Rating"
                    labelIcon={Star}
                    value={
                        <>
                            {studentRatingData?.ratingStats?.overall?.average?.toFixed(1) || "N/A"}
                            <span className="ml-1 text-sm font-normal">/ 5</span>
                        </>
                    }
                    hint="Based on all evaluations"
                    icon={Star}
                    accent="amber"
                />
            </div>

            {/* Charts */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card hover className="p-5">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-brand-100 p-2.5 dark:bg-brand-900/40">
                                <Radar className="h-5 w-5 text-brand-600 dark:text-brand-300" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Project Analytics</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Distribution and completion status
                                </p>
                            </div>
                        </div>
                        <Badge tone="brand">Interactive</Badge>
                    </div>
                    <div className="h-[350px]">
                        <StudentCompletionChart data={studentCompletionData} theme={theme} />
                    </div>
                </Card>

                <Card hover className="p-5">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-fuchsia-100 p-2.5 dark:bg-fuchsia-900/40">
                                <BarChart2 className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-300" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Performance Ratings</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Detailed rating breakdown and trends
                                </p>
                            </div>
                        </div>
                        <Badge tone="brand">Multi-view</Badge>
                    </div>
                    <div className="h-[350px]">
                        <StudentRatingsChart data={studentRatingData} theme={theme} />
                    </div>
                </Card>
            </div>

            {/* Footer */}
            <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
                <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 dark:text-slate-400 sm:flex-row">
                    <div className="flex items-center gap-2">
                        <GanttChartSquare className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                        <span className="whitespace-nowrap">
                            Last updated: <span className="font-medium">{new Date().toLocaleString()}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                        <span className="hidden sm:inline-flex">Real-time monitoring dashboard</span>
                        <span className="inline-flex sm:hidden">Live dashboard</span>
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

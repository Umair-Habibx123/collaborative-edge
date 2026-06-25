import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import PropTypes from "prop-types";
import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import Loading from "../../../../../Components/loadingIndicator/loading";

ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectStatusChart = ({ data, theme }) => {
    const [projectStatusLimit, setProjectStatusLimit] = useState(10);
    const [projectStatusSort, setProjectStatusSort] = useState('desc');

    const resetFilters = () => {
        setProjectStatusLimit(10);
        setProjectStatusSort('desc');
    };

    if (!data || !Array.isArray(data)) {
        return <Loading />;
    }

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm font-medium">
                No data available
            </div>
        );
    }

    const statusData = data.map(item => ({
        status: item.status,
        count: item.count
    }));

    const sortedData = [...statusData].sort((a, b) => {
        return projectStatusSort === 'desc'
            ? b.count - a.count
            : a.count - b.count;
    });

    const limitedData = projectStatusLimit > 0
        ? sortedData.slice(0, projectStatusLimit)
        : sortedData;

    const chartData = {
        labels: limitedData.map(item => {
            switch (item.status) {
                case 'approved': return 'Approved';
                case 'rejected': return 'Rejected';
                case 'needMoreInfo': return 'Needs More Info';
                default: return item.status.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            }
        }),
        datasets: [
            {
                data: limitedData.map(item => item.count),
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',  // green
                    'rgba(239, 68, 68, 0.8)',    // red
                    'rgba(59, 130, 246, 0.8)',   // blue
                    'rgba(234, 179, 8, 0.8)',    // yellow
                    'rgba(139, 92, 246, 0.8)',   // purple
                    'rgba(20, 184, 166, 0.8)',   // teal
                    'rgba(245, 158, 11, 0.8)',  // amber
                    'rgba(236, 72, 153, 0.8)',   // pink
                ],
                borderColor: theme === "dark" ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.8)",
                borderWidth: 1,
                hoverBorderColor: theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.1)",
                hoverOffset: 8
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: theme === "dark" ? "#e5e7eb" : "#374151",
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 8,
                }
            },
            tooltip: {
                backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                titleColor: theme === "dark" ? "#ffffff" : "#111827",
                bodyColor: theme === "dark" ? "#e5e7eb" : "#374151",
                borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                usePointStyle: true,
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '70%',
        animation: {
            animateScale: true,
            animateRotate: true
        }
    };

    return (
        <div className="h-full flex flex-col gap-3 p-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <select
                        value={projectStatusSort}
                        onChange={(e) => setProjectStatusSort(e.target.value)}
                        className={`text-xs p-2 rounded-lg transition-all ${
                            theme === "dark" 
                                ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700" 
                                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                        } border shadow-xs focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500`}
                    >
                        <option value="desc">Most First</option>
                        <option value="asc">Least First</option>
                    </select>
                    
                    <select
                        value={projectStatusLimit}
                        onChange={(e) => setProjectStatusLimit(Number(e.target.value))}
                        className={`text-xs p-2 rounded-lg transition-all ${
                            theme === "dark" 
                                ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700" 
                                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                        } border shadow-xs focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500`}
                    >
                        <option value={5}>Top 5</option>
                        <option value={10}>Top 10</option>
                        <option value={20}>Top 20</option>
                        <option value={data.length}>All</option>
                    </select>
                </div>
                
                <button
                    onClick={resetFilters}
                    className={`flex items-center gap-1 text-xs p-2 rounded-lg transition-all ${
                        theme === "dark" 
                            ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700" 
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    } border shadow-xs hover:text-brand-600 hover:border-brand-200`}
                >
                    <RefreshCcw className="w-3 h-3" />
                    <span>Reset</span>
                </button>
            </div>

            <div className="flex-grow min-h-[300px]">
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
};

ProjectStatusChart.propTypes = {
    data: PropTypes.array,
    theme: PropTypes.string.isRequired,
};

export default ProjectStatusChart;
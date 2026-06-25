// StudentCompletionChart.js
import { Radar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement } from "chart.js";
import PropTypes from "prop-types";
import Loading from "../../../../../Components/loadingIndicator/loading";
import { useState, useRef } from "react";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement);

const COLOR_PALETTES = {
    light: {
        completed: 'rgba(59, 130, 246, 0.8)',
        ongoing: 'rgba(249, 115, 22, 0.8)',
        text: '#1f2937',
        background: '#ffffff',
        grid: 'rgba(0, 0, 0, 0.05)',
        angleLines: 'rgba(0, 0, 0, 0.1)',
        pointBackground: '#ffffff'
    },
    dark: {
        completed: 'rgba(99, 102, 241, 0.8)',
        ongoing: 'rgba(234, 88, 12, 0.8)',
        text: '#e5e7eb',
        background: '#1f2937',
        grid: 'rgba(255, 255, 255, 0.1)',
        angleLines: 'rgba(255, 255, 255, 0.1)',
        pointBackground: '#1f2937'
    }
};

const StudentCompletionChart = ({ data, theme }) => {
    const [chartType, setChartType] = useState('pie');
    const chartRef = useRef(null);

    if (!data) {
        return <Loading />;
    }

    if (data.message === "No projects found for this student") {

        return (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm font-medium">
                No data available at this point
            </div>
        );
    }


    const palette = COLOR_PALETTES[theme === "dark" ? "dark" : "light"];

    const radarData = {
        labels: data.chartData.industryDistribution.map(item => item.industry),
        datasets: [
            {
                label: 'Projects by Industry',
                data: data.chartData.industryDistribution.map(item => item.count),
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                pointBackgroundColor: palette.pointBackground,
                pointBorderColor: 'rgba(99, 102, 241, 1)',
                pointHoverBackgroundColor: palette.pointBackground,
                pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
            }
        ]
    };

    // Pie Chart Data
    const pieData = {
        labels: data.chartData.completionPie.map(item => item.name),
        datasets: [
            {
                data: data.chartData.completionPie.map(item => item.value),
                backgroundColor: [palette.completed, palette.ongoing],
                borderColor: palette.background,
                borderWidth: 1,
                hoverOffset: 15
            }
        ]
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: palette.text,
                    font: {
                        size: 12
                    },
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: palette.background,
                titleColor: palette.text,
                bodyColor: palette.text,
                borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                usePointStyle: true,
                callbacks: {
                    label: (context) => {
                        return `${context.label}: ${context.raw} projects`;
                    }
                }
            }
        },
        scales: {
            r: {
                angleLines: {
                    color: palette.angleLines
                },
                grid: {
                    color: palette.grid,
                    circular: true
                },
                pointLabels: {
                    color: palette.text,
                    font: {
                        size: 11
                    }
                },
                ticks: {
                    display: false,
                    backdropColor: 'transparent'
                },
                suggestedMin: 0
            }
        },
        elements: {
            line: {
                tension: 0.1
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: palette.text,
                    font: {
                        size: 12
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: palette.background,
                titleColor: palette.text,
                bodyColor: palette.text,
                borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '65%'
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="text-lg font-medium" style={{ color: palette.text }}>
                    {chartType === 'radar' ? 'Industry Distribution' : 'Completion Status'}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setChartType('pie')}
                        className={`text-xs px-3 py-1 rounded-md ${chartType === 'pie' ?
                            (theme === "dark" ? "bg-gray-700 text-white" : "bg-brand-100 text-brand-600") :
                            (theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600")}`}
                    >
                        Projects
                    </button>
                    <button
                        onClick={() => setChartType('radar')}
                        className={`text-xs px-3 py-1 rounded-md ${chartType === 'radar' ?
                            (theme === "dark" ? "bg-gray-700 text-white" : "bg-brand-100 text-brand-600") :
                            (theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600")}`}
                    >
                        Industry
                    </button>
                </div>
            </div>


            <div className="flex-grow min-h-[250px]">
                {chartType === 'radar' ? (
                    <Radar
                        ref={chartRef}
                        data={radarData}
                        options={radarOptions}
                    />
                ) : (
                    <Pie
                        data={pieData}
                        options={pieOptions}
                    />
                )}
            </div>

            <div className={`flex items-center justify-between mt-2 px-4 py-2 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
                <div className="flex items-center gap-2">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Total Projects
                    </span>
                </div>
                <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {data.stats.total}
                </span>
            </div>
        </div>
    );
};

StudentCompletionChart.propTypes = {
    data: PropTypes.shape({
        message: PropTypes.string,
        stats: PropTypes.object.isRequired,
        timelineData: PropTypes.array.isRequired,
        chartData: PropTypes.shape({
            completionPie: PropTypes.array.isRequired,
            industryDistribution: PropTypes.array.isRequired,
            completionTimeline: PropTypes.array.isRequired
        }).isRequired
    }),
    theme: PropTypes.string.isRequired,
};

export default StudentCompletionChart;
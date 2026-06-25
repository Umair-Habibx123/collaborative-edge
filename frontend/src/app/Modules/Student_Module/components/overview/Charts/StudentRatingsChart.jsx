// StudentRatingsChart.js
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler, ArcElement, PointElement, LineElement } from "chart.js";
import PropTypes from "prop-types";
import { useState, useRef } from "react";
import { Star } from "lucide-react"
import Loading from "../../../../../Components/loadingIndicator/loading";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler, ArcElement, PointElement, LineElement);

const COLOR_PALETTES = {
    light: {
        overall: ['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.8)'],
        teacher: ['rgba(16, 185, 129, 0.8)', 'rgba(5, 150, 105, 0.8)'],
        industry: ['rgba(236, 72, 153, 0.8)', 'rgba(219, 39, 119, 0.8)'],
        stars: {
            1: 'rgba(239, 68, 68, 0.8)',
            2: 'rgba(249, 115, 22, 0.8)',
            3: 'rgba(251, 191, 36, 0.8)',
            4: 'rgba(52, 211, 153, 0.8)',
            5: 'rgba(16, 185, 129, 0.8)'
        },
        text: '#1f2937',
        background: '#ffffff',
        grid: 'rgba(0, 0, 0, 0.05)'
    },
    dark: {
        overall: ['rgba(129, 140, 248, 0.8)', 'rgba(99, 102, 241, 0.8)'],
        teacher: ['rgba(52, 211, 153, 0.8)', 'rgba(16, 185, 129, 0.8)'],
        industry: ['rgba(244, 114, 182, 0.8)', 'rgba(236, 72, 153, 0.8)'],
        stars: {
            1: 'rgba(239, 68, 68, 0.8)',
            2: 'rgba(249, 115, 22, 0.8)',
            3: 'rgba(251, 191, 36, 0.8)',
            4: 'rgba(52, 211, 153, 0.8)',
            5: 'rgba(16, 185, 129, 0.8)'
        },
        text: '#e5e7eb',
        background: '#1f2937',
        grid: 'rgba(255, 255, 255, 0.1)'
    }
};

const StudentRatingsChart = ({ data, theme }) => {
    const [viewMode, setViewMode] = useState('distribution');
    const chartRef = useRef(null);

    if (!data) {
        return <Loading />;
    }

    // Check if student not found or no ratings data available
    if (data.message === "Student not found" ||
        (data.ratingStats.overall.total === 0 &&
            data.ratingStats.distribution.every(item => item.count === 0) &&
            data.ratingStats.byRole.teacher.count === 0 &&
            data.ratingStats.byRole.industry.count === 0)) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm font-medium">
                No data available at this point
            </div>
        );
    }



    const palette = COLOR_PALETTES[theme === "dark" ? "dark" : "light"];

    // Prepare data for different chart types
    const distributionData = {
        labels: data.ratingStats.distribution.map(item => `${item.stars} Star${item.stars > 1 ? 's' : ''}`),
        datasets: [{
            data: data.ratingStats.distribution.map(item => item.count),
            backgroundColor: data.ratingStats.distribution.map(item => palette.stars[item.stars]),
            borderColor: palette.background,
            borderWidth: 1,
            hoverOffset: 15
        }]
    };

    const timelineData = {
        labels: data.timeline.map(item => item.date),
        datasets: [{
            label: 'Ratings Timeline',
            data: data.timeline.map(item => item.rating),
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: palette.background,
            pointBorderColor: 'rgba(99, 102, 241, 1)',
            pointHoverBackgroundColor: palette.background,
            pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    const byRoleData = {
        labels: ['Teacher', 'Industry'],
        datasets: [{
            label: 'Average Rating',
            data: [
                data.ratingStats.byRole.teacher.average,
                data.ratingStats.byRole.industry.average
            ],
            backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(236, 72, 153, 0.8)'
            ],
            borderColor: [
                'rgba(99, 102, 241, 1)',
                'rgba(236, 72, 153, 1)'
            ],
            borderWidth: 1,
            borderRadius: 6
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: palette.text,
                    boxWidth: 12,
                    padding: 16,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
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
                usePointStyle: true,
                callbacks: {
                    label: (context) => {
                        if (viewMode === 'distribution') {
                            const total = data.ratingStats.overall.total;
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                        }
                        return `${context.label || ''}: ${context.raw.toFixed(1)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 5,
                grid: {
                    color: palette.grid,
                    drawBorder: false,
                },
                ticks: {
                    color: palette.text,
                    stepSize: 1
                },
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: palette.text,
                },
            },
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        },
        interaction: {
            mode: 'index',
            intersect: false
        }
    };

    const pieOptions = {
        ...options,
        scales: {},
        cutout: '65%'
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <button
                    onClick={() => setViewMode('distribution')}
                    className={`text-xs px-3 py-1 rounded-md ${viewMode === 'distribution' ?
                        (theme === "dark" ? "bg-gray-700 text-white" : "bg-brand-100 text-brand-600") :
                        (theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600")}`}
                >
                    Distribution
                </button>
                <button
                    onClick={() => setViewMode('timeline')}
                    className={`text-xs px-3 py-1 rounded-md ${viewMode === 'timeline' ?
                        (theme === "dark" ? "bg-gray-700 text-white" : "bg-brand-100 text-brand-600") :
                        (theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600")}`}
                >
                    Timeline
                </button>
                <button
                    onClick={() => setViewMode('byRole')}
                    className={`text-xs px-3 py-1 rounded-md ${viewMode === 'byRole' ?
                        (theme === "dark" ? "bg-gray-700 text-white" : "bg-brand-100 text-brand-600") :
                        (theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600")}`}
                >
                    By Role
                </button>
            </div>

            <div className="flex-grow">
                {viewMode === 'distribution' ? (
                    <Pie
                        ref={chartRef}
                        data={distributionData}
                        options={pieOptions}
                    />
                ) : viewMode === 'timeline' ? (
                    <Line
                        ref={chartRef}
                        data={timelineData}
                        options={options}
                    />
                ) : (
                    <Bar
                        ref={chartRef}
                        data={byRoleData}
                        options={options}
                    />
                )}
            </div>

            <div className={`flex items-center justify-between mt-4 px-4 py-2 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Average Rating
                    </span>
                </div>
                <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {data.ratingStats.overall.average?.toFixed(1) || 'N/A'} / 5
                </span>
            </div>
        </div>
    );
};

StudentRatingsChart.propTypes = {
    data: PropTypes.shape({
        message: PropTypes.string,

        ratingStats: PropTypes.shape({
            overall: PropTypes.shape({
                average: PropTypes.number,
                total: PropTypes.number
            }),
            distribution: PropTypes.arrayOf(
                PropTypes.shape({
                    stars: PropTypes.number,
                    count: PropTypes.number
                })
            ),
            byRole: PropTypes.shape({
                teacher: PropTypes.shape({
                    average: PropTypes.number,
                    count: PropTypes.number,
                }),
                industry: PropTypes.shape({
                    average: PropTypes.number,
                    count: PropTypes.number,
                })
            })
        }),
        timeline: PropTypes.arrayOf(
            PropTypes.shape({
                date: PropTypes.string,
                rating: PropTypes.number,
                role: PropTypes.string
            })
        )
    }),
    theme: PropTypes.string.isRequired,
};

export default StudentRatingsChart;
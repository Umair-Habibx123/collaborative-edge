import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import PropTypes from "prop-types";
import Loading from "../../../../../Components/loadingIndicator/loading";
import { useState, useRef } from "react";
import {RefreshCcw} from "lucide-react"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Enhanced color schemes for different themes
const COLOR_SCHEMES = {
    light: {
        gradientStart: 'rgba(99, 102, 241, 0.3)',
        gradientEnd: 'rgba(99, 102, 241, 0.05)',
        lineColor: 'rgba(99, 102, 241, 1)',
        pointColor: 'rgba(99, 102, 241, 1)',
        gridColor: 'rgba(0, 0, 0, 0.05)',
        tickColor: '#6b7280'
    },
    dark: {
        gradientStart: 'rgba(139, 92, 246, 0.3)',
        gradientEnd: 'rgba(139, 92, 246, 0.05)',
        lineColor: 'rgba(167, 139, 250, 1)',
        pointColor: 'rgba(167, 139, 250, 1)',
        gridColor: 'rgba(255, 255, 255, 0.05)',
        tickColor: '#9ca3af'
    }
};

const ProjectsTimelineChart = ({ data, theme }) => {
    const [timeRange, setTimeRange] = useState('all');
    const [dataPoints, setDataPoints] = useState('monthly');
    const chartRef = useRef(null);

    const resetFilters = () => {
        setTimeRange('all');
        setDataPoints('monthly');
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

    // Process data based on selected filters
    const processData = () => {
        const now = new Date();
        let filteredData = [...data];

        // Apply time range filter
        if (timeRange !== 'all') {
            const cutoffDate = new Date();
            cutoffDate.setMonth(now.getMonth() - parseInt(timeRange));
            filteredData = filteredData.filter(project =>
                new Date(project.createdAt) >= cutoffDate
            );
        }

        // Group data by time period
        const counts = {};
        filteredData.forEach(project => {
            const date = new Date(project.createdAt);
            let periodKey;

            if (dataPoints === 'monthly') {
                periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            } else { // yearly
                periodKey = date.getFullYear().toString();
            }

            counts[periodKey] = (counts[periodKey] || 0) + 1;
        });

        // Sort periods chronologically
        return Object.keys(counts).sort().map(key => ({
            period: key,
            count: counts[key]
        }));
    };

    const processedData = processData();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const colors = COLOR_SCHEMES[theme === "dark" ? "dark" : "light"];

    const chartData = {
        labels: processedData.map(item => {
            if (dataPoints === 'monthly') {
                const [year, monthNum] = item.period.split('-');
                return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
            }
            return item.period;
        }),
        datasets: [
            {
                label: 'Projects Uploaded',
                data: processedData.map(item => item.count),
                borderColor: colors.lineColor,
                borderWidth: 2,
                tension: 0.4,
                fill: {
                    target: 'origin',
                    above: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
                        gradient.addColorStop(0, colors.gradientStart);
                        gradient.addColorStop(1, colors.gradientEnd);
                        return gradient;
                    }
                },
                backgroundColor: 'transparent',
                pointBackgroundColor: colors.pointColor,
                pointBorderColor: theme === "dark" ? '#1f2937' : '#f9fafb',
                pointRadius: 4,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: theme === "dark" ? '#1f2937' : '#f9fafb',
                pointHoverBorderColor: colors.lineColor,
                pointBorderWidth: 2
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
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
                    labelColor: () => ({
                        borderColor: 'transparent',
                        backgroundColor: colors.lineColor,
                        borderRadius: 4
                    }),
                    label: (context) => {
                        return `${context.parsed.y} projects`;
                    },
                    title: (context) => {
                        return context[0].label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: colors.gridColor,
                    drawBorder: false,
                },
                ticks: {
                    color: colors.tickColor,
                    callback: (value) => Number.isInteger(value) ? value : null,
                    font: {
                        weight: 500
                    }
                },
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: colors.tickColor,
                    maxRotation: dataPoints === 'monthly' ? 45 : 0,
                    minRotation: dataPoints === 'monthly' ? 45 : 0,
                    font: {
                        weight: 500
                    }
                },
            },
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    };

    return (
        <div className="h-full flex flex-col gap-3 p-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className={`text-xs p-2 rounded-lg transition-all ${
                            theme === "dark" 
                                ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700" 
                                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                        } border shadow-xs focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500`}
                    >
                        <option value="3">Last 3 Months</option>
                        <option value="6">Last 6 Months</option>
                        <option value="12">Last Year</option>
                        <option value="all">All Time</option>
                    </select>
                    
                    <select
                        value={dataPoints}
                        onChange={(e) => setDataPoints(e.target.value)}
                        className={`text-xs p-2 rounded-lg transition-all ${
                            theme === "dark" 
                                ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700" 
                                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                        } border shadow-xs focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500`}
                    >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
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
                <Line
                    ref={chartRef}
                    data={chartData}
                    options={options}
                />
            </div>
        </div>
    );
};

ProjectsTimelineChart.propTypes = {
    data: PropTypes.array,
    theme: PropTypes.string.isRequired,
};

export default ProjectsTimelineChart;
import { Radar } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import PropTypes from "prop-types";
import Loading from "../../../../../Components/loadingIndicator/loading";
import { useState, useRef } from "react";
import { RefreshCcw } from "lucide-react";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const COLOR_PALETTES = {
    light: [
        'rgba(99, 102, 241, 0.7)',
        'rgba(14, 165, 233, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(20, 184, 166, 0.7)',
        'rgba(236, 72, 153, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(59, 130, 246, 0.7)'
    ],
    dark: [
        'rgba(99, 102, 241, 0.9)',
        'rgba(14, 165, 233, 0.9)',
        'rgba(139, 92, 246, 0.9)',
        'rgba(20, 184, 166, 0.9)',
        'rgba(236, 72, 153, 0.9)',
        'rgba(245, 158, 11, 0.9)',
        'rgba(16, 185, 129, 0.9)',
        'rgba(59, 130, 246, 0.9)'
    ]
};

const ProjectsBySkillsChart = ({ data, theme }) => {
    const [itemCount, setItemCount] = useState(8);
    const [sortOrder, setSortOrder] = useState('most');
    const chartRef = useRef(null);

    const resetFilters = () => {
        setItemCount(8);
        setSortOrder('most');
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

    const sortedSkills = [...data]
        .sort((a, b) => sortOrder === 'most' ? b.count - a.count : a.count - b.count)
        .slice(0, itemCount);

    const palette = COLOR_PALETTES[theme === "dark" ? "dark" : "light"];

    const chartData = {
        labels: sortedSkills.map(item => item.skill),
        datasets: [
            {
                label: 'Skills Demand',
                data: sortedSkills.map(item => item.count),
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;

                    if (!chartArea) return palette[0];

                    const gradient = ctx.createRadialGradient(
                        chartArea.width / 2,
                        chartArea.height / 2,
                        0,
                        chartArea.width / 2,
                        chartArea.height / 2,
                        Math.min(chartArea.width, chartArea.height) / 2
                    );

                    gradient.addColorStop(0, theme === "dark"
                        ? 'rgba(99, 102, 241, 0.4)'
                        : 'rgba(99, 102, 241, 0.2)');
                    gradient.addColorStop(1, theme === "dark"
                        ? 'rgba(99, 102, 241, 0.1)'
                        : 'rgba(99, 102, 241, 0.05)');

                    return gradient;
                },
                borderColor: palette[0],
                borderWidth: 2,
                pointBackgroundColor: palette.map(color => color.replace('0.7', '1').replace('0.9', '1')),
                pointBorderColor: theme === "dark" ? '#1f2937' : '#f9fafb',
                pointHoverBackgroundColor: theme === "dark" ? '#1f2937' : '#f9fafb',
                pointHoverBorderColor: palette[0],
                pointRadius: 4,
                pointHoverRadius: 6,
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
                    labelColor: (context) => {
                        return {
                            borderColor: 'transparent',
                            backgroundColor: palette[context.dataIndex % palette.length],
                            borderRadius: 4
                        };
                    },
                    label: (context) => {
                        return `${context.label}: ${context.raw}`;
                    }
                }
            }
        },
        scales: {
            r: {
                angleLines: {
                    color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
                },
                grid: {
                    color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                    circular: true
                },
                pointLabels: {
                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                    font: {
                        size: 11,
                        weight: '500'
                    },
                    backdropColor: 'transparent'
                },
                ticks: {
                    display: false,
                    backdropColor: 'transparent'
                },
                suggestedMin: 0
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        },
        elements: {
            line: {
                tension: 0.3
            }
        }
    };

    return (
        <div className="h-full flex flex-col gap-3 p-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className={`text-xs p-2 rounded-lg transition-all ${
                            theme === "dark" 
                                ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700" 
                                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                        } border shadow-xs focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500`}
                    >
                        <option value="most">Most First</option>
                        <option value="least">Least First</option>
                    </select>
                    
                    <select
                        value={itemCount}
                        onChange={(e) => setItemCount(Number(e.target.value))}
                        className={`text-xs p-2 rounded-lg transition-all ${
                            theme === "dark" 
                                ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700" 
                                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                        } border shadow-xs focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500`}
                    >
                        <option value={5}>Top 5</option>
                        <option value={8}>Top 8</option>
                        <option value={10}>Top 10</option>
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
                <Radar
                    ref={chartRef}
                    data={chartData}
                    options={options}
                />
            </div>
        </div>
    );
};

ProjectsBySkillsChart.propTypes = {
    data: PropTypes.array,
    theme: PropTypes.string.isRequired,
};

export default ProjectsBySkillsChart;
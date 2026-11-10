import { ChartOptions } from "chart.js";

/**
 * Generates an array of colors for chart datasets
 */
export const generateColors = (count: number) => {
    const baseColors = [
        'rgba(147,196,125,0.7)', 'rgba(255,159,64,0.7)', 'rgba(54,162,235,0.7)',
        'rgba(255,99,132,0.7)', 'rgba(75,192,192,0.7)', 'rgba(153,102,255,0.7)',
        'rgba(255,205,86,0.7)', 'rgba(201,203,207,0.7)', 'rgba(255,152,0,0.7)',
        'rgba(121,85,72,0.7)', 'rgba(96,125,139,0.7)', 'rgba(156,39,176,0.7)',
    ];
    return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
};

/**
 * Common formatter for currency in tooltips
 */
export const formatCurrency = (value: number) => {
    return Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

export const getPieChartOptions = (onClick: any): ChartOptions<"pie"> => ({
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
        legend: {
            position: 'right' as const,
            labels: { font: { size: 10 } }
        },
        tooltip: {
            callbacks: {
                label: (context: any) => {
                    const label = context.label || '';
                    const value = context.raw as number;
                    return `${label}: ${formatCurrency(value)}`;
                }
            }
        }
    },
    onClick: onClick,
});

export const getBarChartOptions = (onClick: any): ChartOptions<"bar"> => ({
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
        legend: {
            display: false
        },
        title: {
            display: false
        },
        tooltip: {
            callbacks: {
                label: (context: any) => {
                    const value = context.raw as number;
                    return `Revenue: ${formatCurrency(value)}`;
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: function (value: any) {
                    return Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(value);
                }
            }
        }
    },
    onClick: onClick,
});

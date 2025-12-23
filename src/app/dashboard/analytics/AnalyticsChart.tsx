'use client';

import styles from './Analytics.module.css';

interface ChartData {
    date: string;
    views: number;
}

interface AnalyticsChartProps {
    data: ChartData[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
    const maxViews = Math.max(...data.map(d => d.views), 1);

    // Take last 14 days for display
    const recentData = data.slice(-14);

    return (
        <div className={styles.chart}>
            <div className={styles.chartBars}>
                {recentData.map((d, i) => {
                    const height = (d.views / maxViews) * 100;
                    const dateLabel = new Date(d.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });

                    return (
                        <div key={i} className={styles.barContainer}>
                            <div
                                className={styles.bar}
                                style={{ height: `${Math.max(height, 2)}%` }}
                                title={`${dateLabel}: ${d.views} views`}
                            >
                                <span className={styles.barValue}>{d.views}</span>
                            </div>
                            <span className={styles.barLabel}>{dateLabel}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

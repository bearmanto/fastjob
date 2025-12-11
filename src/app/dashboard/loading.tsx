import styles from './Dashboard.module.css';

export default function DashboardLoading() {
    return (
        <div className={styles.dashboardContainer}>
            <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#666'
            }}>
                <div style={{
                    display: 'inline-block',
                    width: '24px',
                    height: '24px',
                    border: '3px solid #e0e0e0',
                    borderTopColor: 'var(--hunter-green)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <p style={{ marginTop: '16px', fontSize: '14px' }}>Loading dashboard...</p>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}

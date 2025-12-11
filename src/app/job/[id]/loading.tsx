import styles from './Job.module.css';

export default function JobLoading() {
    return (
        <div className={styles.container}>
            <div className={styles.mainColumn}>
                {/* Skeleton breadcrumb */}
                <div style={{ height: '20px', background: '#f0f0f0', width: '200px', marginBottom: '24px' }} />

                {/* Skeleton title */}
                <div style={{ height: '32px', background: '#f0f0f0', width: '60%', marginBottom: '12px' }} />
                <div style={{ height: '18px', background: '#f5f5f5', width: '40%', marginBottom: '32px' }} />

                {/* Skeleton table */}
                <div style={{ height: '24px', background: '#f0f0f0', width: '30%', marginBottom: '16px' }} />
                <div style={{ background: '#fafafa', padding: '16px', marginBottom: '24px' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{
                            height: '20px',
                            background: '#f0f0f0',
                            marginBottom: '12px',
                            width: `${60 + i * 5}%`
                        }} />
                    ))}
                </div>
            </div>

            <div className={styles.sideColumn}>
                <div style={{
                    background: '#f5f5f5',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '13px'
                }}>
                    Loading...
                </div>
            </div>
        </div>
    );
}

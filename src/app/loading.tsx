import styles from './page.module.css';

export default function HomeLoading() {
    return (
        <div className={styles.container}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <div style={{ height: '28px', background: '#f0f0f0', width: '250px' }} />
                <div style={{ height: '16px', background: '#f5f5f5', width: '150px' }} />
            </div>

            <div style={{ height: '16px', background: '#f5f5f5', width: '300px', marginBottom: '32px' }} />

            <div className={styles.jobStream}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={styles.streamItem} style={{ opacity: 1 - i * 0.1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ height: '20px', background: '#f0f0f0', width: '60%' }} />
                            <div style={{ height: '14px', background: '#f5f5f5', width: '80px' }} />
                        </div>
                        <div style={{ height: '14px', background: '#f5f5f5', width: '40%', marginBottom: '8px' }} />
                        <div style={{ height: '12px', background: '#fafafa', width: '30%', marginBottom: '12px' }} />
                        <div style={{ height: '14px', background: '#fafafa', width: '90%' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

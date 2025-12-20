import styles from './Job.module.css';
import skeleton from '@/components/ui/Skeleton.module.css';

export default function JobLoading() {
    const ROW_WIDTHS = ['65%', '70%', '75%', '80%', '85%'];

    return (
        <div className={styles.container}>
            <div className={styles.mainColumn}>
                {/* Skeleton breadcrumb */}
                <div className={`${skeleton.skeletonBlock} ${skeleton.skeletonBreadcrumb}`} />

                {/* Skeleton title */}
                <div className={`${skeleton.skeletonBlock} ${skeleton.skeletonJobTitle}`} />
                <div className={`${skeleton.skeletonBlockLight} ${skeleton.skeletonJobCompany}`} />

                {/* Skeleton table */}
                <div className={`${skeleton.skeletonBlock} ${skeleton.skeletonSectionTitle}`} />
                <div className={skeleton.skeletonTableContainer}>
                    {ROW_WIDTHS.map((width, i) => (
                        <div
                            key={i}
                            className={`${skeleton.skeletonBlock} ${skeleton.skeletonTableRow}`}
                            style={{ width }}
                        />
                    ))}
                </div>
            </div>

            <div className={styles.sideColumn}>
                <div className={skeleton.skeletonSidePanel}>
                    Loading...
                </div>
            </div>
        </div>
    );
}

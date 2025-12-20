import pageStyles from './page.module.css';
import skeleton from '@/components/ui/Skeleton.module.css';

const OPACITY_CLASSES = [
    '',
    skeleton.opacity90,
    skeleton.opacity80,
    skeleton.opacity70,
    skeleton.opacity60,
];

export default function HomeLoading() {
    return (
        <div className={pageStyles.container}>
            <div className={skeleton.skeletonRow}>
                <div className={`${skeleton.skeletonBlock} ${skeleton.skeletonTitle}`} />
                <div className={`${skeleton.skeletonBlockLight} ${skeleton.skeletonSubtitle}`} />
            </div>

            <div className={`${skeleton.skeletonBlockLight} ${skeleton.skeletonIntro}`} />

            <div className={pageStyles.jobStream}>
                {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className={`${pageStyles.streamItem} ${OPACITY_CLASSES[i]}`}>
                        <div className={skeleton.skeletonItemRow}>
                            <div className={`${skeleton.skeletonBlock} ${skeleton.skeletonItemTitle}`} />
                            <div className={`${skeleton.skeletonBlockLight} ${skeleton.skeletonItemDate}`} />
                        </div>
                        <div className={`${skeleton.skeletonBlockLight} ${skeleton.skeletonItemCompany}`} />
                        <div className={`${skeleton.skeletonBlockLighter} ${skeleton.skeletonItemMeta}`} />
                        <div className={`${skeleton.skeletonBlockLighter} ${skeleton.skeletonItemDesc}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

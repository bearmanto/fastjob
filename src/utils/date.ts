export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return `${Math.floor(diffInSeconds / 86400)}d ago`; // Up to 2 days
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`; // Up to 7 days

    return date.toLocaleDateString();
}

export function isFresh(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffInHours < 48; // Less than 48 hours old
}

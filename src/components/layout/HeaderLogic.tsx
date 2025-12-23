'use client';

import { usePathname } from 'next/navigation';

export function HeaderLogic({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Hide header on test homepage
    if (pathname === '/test-homepage') {
        return null;
    }

    return <>{children}</>;
}

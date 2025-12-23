'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './Header.module.css';

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Check if current path matches the href
    let isActive = false;

    if (href.includes('?')) {
        // Handle query params (e.g. /?collection=fresh)
        const [targetPath, targetQuery] = href.split('?');
        const targetParams = new URLSearchParams(targetQuery);

        // Check path match first
        if (pathname === targetPath) {
            // Check if all params in target exist in current searchParams
            let paramsMatch = true;
            targetParams.forEach((value, key) => {
                if (searchParams.get(key) !== value) {
                    paramsMatch = false;
                }
            });
            isActive = paramsMatch;
        }
    } else {
        // Standard path matching
        // Special case: Home '/' should only match exact, but check if we have query params?
        // If we contain query params in browser but link is just '/', usually that means "All" 
        // effectively resetting params. So only active if *no* collection param?
        // User wants "All Jobs" to be active when NO collection is selected.

        if (href === '/') {
            isActive = pathname === '/' && !searchParams.has('collection');
        } else {
            isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        }
    }

    return (
        <Link
            href={href}
            className={isActive ? styles.active : undefined}
            aria-current={isActive ? 'page' : undefined}
        >
            {children}
        </Link>
    );
}

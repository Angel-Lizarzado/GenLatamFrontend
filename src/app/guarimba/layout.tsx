import { ReactNode } from 'react';

export default function GuarimbaLayout({ children }: { children: ReactNode }) {
    return (
        <div data-theme="dark" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
            {children}
        </div>
    );
}

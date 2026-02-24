import { ReactNode } from 'react';

export default function ExitLayout({ children }: { children: ReactNode }) {
    return (
        <div data-theme="dark" style={{ minHeight: '100vh', backgroundColor: '#000', color: '#FFF' }}>
            {children}
        </div>
    );
}

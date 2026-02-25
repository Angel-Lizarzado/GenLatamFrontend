'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ConfiguracionGlobal, getStrapiMedia } from '@/lib/api';
import { Menu, X } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
    configuracion: ConfiguracionGlobal | null;
    mode: 'b2b' | 'b2c';
    title?: string;
    href?: string;
    logo?: {
        url: string;
        width: number;
        height: number;
        alternativeText: string | null;
    } | null;
}

export default function Header({ configuracion, mode, title, href, logo }: HeaderProps) {
    const isB2B = mode === 'b2b';
    const finalLogo = logo || configuracion?.logo;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    return (
        <header className={`${styles.header} ${isB2B ? styles.headerB2B : styles.headerB2C}`}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <Link href={href || (isB2B ? '/' : '/guarimba')}>
                        {finalLogo?.url ? (
                            <img
                                src={getStrapiMedia(finalLogo.url)!}
                                alt={title || (isB2B ? 'GenLatam' : 'Guarimba')}
                                className={styles.logoImage}
                                style={{ maxHeight: '40px', width: 'auto' }}
                            />
                        ) : (
                            title || (isB2B ? 'GenLatam' : 'Guarimba')
                        )}
                    </Link>
                </div>

                <nav className={styles.navDesktop}>
                    <Link href="/" className={styles.link}>Inicio</Link>
                    <Link href="/servicios" className={styles.link}>Servicios</Link>
                    <Link href="/casos" className={styles.link}>Casos de Éxito</Link>

                    <Link href="/contacto" className={styles.contactBtn}>
                        Contacto
                    </Link>
                </nav>

                <button
                    className={styles.mobileMenuBtn}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenuOverlay}>
                    <nav className={styles.navMobile}>
                        <Link href="/" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Inicio</Link>
                        <Link href="/servicios" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Servicios</Link>
                        <Link href="/casos" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Casos de Éxito</Link>
                        <Link href="/contacto" className={styles.mobileContactBtn} onClick={() => setIsMobileMenuOpen(false)}>
                            Contacto
                        </Link>
                    </nav>
                </div>
            )}

            {configuracion?.bannerActivo && configuracion.bannerTexto && (
                <div className={styles.banner}>
                    <p>{configuracion.bannerTexto}</p>
                </div>
            )}
        </header>
    );
}

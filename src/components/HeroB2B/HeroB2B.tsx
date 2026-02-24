import Link from 'next/link';
import Image from 'next/image';
import { HomeB2B, getStrapiMedia } from '@/lib/api';
import { ChevronRight } from 'lucide-react';
import styles from './HeroB2B.module.css';

interface HeroB2BProps {
    data: HomeB2B | null;
}

export default function HeroB2B({ data }: HeroB2BProps) {
    if (!data) return null; // O un skeleton loader

    return (
        <section
            className={styles.heroSection}
            style={{ backgroundColor: data.colorFondoHome || 'var(--color-bg-primary)' }}
        >
            {/* Background elements for depth */}
            {data.fondoHome?.url ? (
                <div className={styles.bgImageContainer}>
                    <Image
                        src={getStrapiMedia(data.fondoHome.url) || ''}
                        alt={data.fondoHome.alternativeText || 'Fondo GenLatam'}
                        fill
                        className={styles.bgImage}
                        priority
                    />
                    <div className={styles.bgImageOverlay} />
                </div>
            ) : (
                <>
                    <div className={styles.bgGlowBase} />
                    <div className={styles.bgGlowAccent} />
                </>
            )}

            <div className={styles.container}>
                <div className={styles.visuals}>
                    <div className={styles.metricsGrid}>
                        {data.metricasDestacadas?.map((metrica) => (
                            <div key={metrica.id} className={styles.metricCard}>
                                <div className={styles.metricValue}>{metrica.valor}</div>
                                <div className={styles.metricLabel}>{metrica.etiqueta}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.badge}>
                        <span className={styles.badgeDot}></span>
                        Agencia Consultora B2B
                    </div>

                    <h1 className={styles.title}>
                        {data.heroTitulo}
                    </h1>

                    <p className={styles.subtitle}>
                        {data.heroSubtitulo}
                    </p>

                    <div className={styles.actions}>
                        <Link href={data.heroCtaUrl} className={styles.primaryBtn}>
                            {data.heroCtaTexto}
                            <ChevronRight size={20} />
                        </Link>
                        <Link href="/casos" className={styles.secondaryBtn}>
                            Ver Casos de Éxito
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

import Header from "@/components/Header/Header";
import { getConfiguracionGlobal, getCasosDeExito, getStrapiMedia } from "@/lib/api";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer/Footer";
import styles from './page.module.css';
import Image from "next/image";

export default async function CasosPage() {
    const [configuracion, casos] = await Promise.all([
        getConfiguracionGlobal(),
        getCasosDeExito()
    ]);

    return (
        <div className={styles.pageWrapper}>
            <Header configuracion={configuracion} mode="b2b" />

            <main className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.badge}>Portafolio</div>
                    <h1 className={styles.title}>Casos de Éxito</h1>
                    <p className={styles.subtitle}>
                        Estrategias ganadoras, respaldadas por datos. Conoce las campañas donde nuestra
                        metodología de movilización digital ha marcado la diferencia.
                    </p>
                </div>

                {casos && casos.length > 0 ? (
                    <div className={styles.grid}>
                        {casos.map((caso, index) => {
                            const imageUrl = caso.imagenPortada?.url
                                ? getStrapiMedia(caso.imagenPortada.url)
                                : null;

                            return (
                                <Link href={`/casos/${caso.slug}`} key={caso.id} className={styles.card} style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className={styles.imageContainer}>
                                        {imageUrl ? (
                                            <Image
                                                src={imageUrl}
                                                alt={caso.imagenPortada?.alternativeText || caso.titulo}
                                                fill
                                                className={styles.image}
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className={styles.placeholderImage}>
                                                GenLatam Case
                                            </div>
                                        )}
                                        {caso.actorPrincipal && (
                                            <div className={styles.clientTag}>
                                                {caso.actorPrincipal}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h2 className={styles.cardTitle}>{caso.titulo}</h2>
                                        <p className={styles.cardSummary}>{caso.resumen}</p>

                                        {/* Inline Metrics for the Card */}
                                        {caso.metricasLogradas && caso.metricasLogradas.length > 0 && (
                                            <div className={styles.miniMetrics}>
                                                {caso.metricasLogradas.slice(0, 2).map(m => (
                                                    <div key={m.id} className={styles.miniMetric}>
                                                        <strong>{m.valor}</strong> <span>{m.etiqueta}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className={styles.readMore}>
                                            Leer Caso Completo <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>Aún no hay casos de éxito publicados en la base de datos.</p>
                        <p className={styles.helpText}>Ve a Strapi &rarr; Casos de Éxito y crea tu primer registro.</p>
                    </div>
                )}
            </main>

            <Footer mode="b2b" />
        </div>
    );
}

import Header from "@/components/Header/Header";
import { getConfiguracionGlobal, getCasoDeExitoBySlug, getStrapiMedia } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber/AnimatedNumber";
import Footer from "@/components/Footer/Footer";
import ReactMarkdown from 'react-markdown';
import styles from './page.module.css';
import Image from "next/image";
import { notFound } from "next/navigation";

// YouTube API Fetcher
async function getYouTubeChannelStats(channelId: string) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails&id=${channelId}&key=${apiKey}`, {
            next: { revalidate: 3600 }
        });

        if (!response.ok) return null;

        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const channel = data.items[0];
            const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;

            let recentVideos: any[] = [];
            if (uploadsPlaylistId) {
                const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=3&key=${apiKey}`, {
                    next: { revalidate: 3600 }
                });
                if (videosResponse.ok) {
                    const videosData = await videosResponse.json();
                    if (videosData.items) {
                        recentVideos = videosData.items.map((item: any) => ({
                            id: item.snippet.resourceId.videoId,
                            title: item.snippet.title,
                            thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url
                        }));
                    }
                }
            }

            return {
                title: channel.snippet.title,
                subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
                viewCount: parseInt(channel.statistics.viewCount) || 0,
                videoCount: parseInt(channel.statistics.videoCount) || 0,
                recentVideos
            };
        }
        return null;
    } catch {
        return null;
    }
}

interface CasoProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function CasoDetailPage({ params }: CasoProps) {
    const { slug } = await params;

    const [configuracion, caso] = await Promise.all([
        getConfiguracionGlobal(),
        getCasoDeExitoBySlug(slug)
    ]);

    if (!caso) {
        notFound();
    }

    const imageUrl = caso.imagenPortada?.url
        ? getStrapiMedia(caso.imagenPortada.url)
        : null;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long'
        });
    };

    // Pre-fetch all YouTube data in parallel for this case study
    const youtubeStatsPromises = caso.crecimientoYoutube?.map(async (yt) => {
        const liveStats = await getYouTubeChannelStats(yt.youtubeChannelId);

        // Calcular crecimiento si existe línea base
        let porcentajeCrecimiento = null;
        if (yt.suscriptoresAntes && liveStats && liveStats.subscriberCount > 0) {
            const antes = parseInt(yt.suscriptoresAntes);
            const despues = liveStats.subscriberCount;
            if (antes > 0 && despues > antes) {
                const growth = ((despues - antes) / antes) * 100;
                porcentajeCrecimiento = `+${growth.toFixed(1)}%`;
            }
        }

        return {
            ...yt,
            liveStats,
            porcentajeCrecimiento
        };
    }) || [];

    const youtubeDataWithLiveStats = await Promise.all(youtubeStatsPromises);

    return (
        <div className={styles.pageWrapper}>
            <Header configuracion={configuracion} mode="b2b" />

            <main className={styles.container}>
                <Link href="/casos" className={styles.backLink}>
                    <ArrowLeft size={20} /> Volver a Casos
                </Link>

                <article className={styles.article}>
                    <header className={styles.articleHeader}>
                        <h1 className={styles.title}>{caso.titulo}</h1>

                        <div className={styles.metaData}>
                            {caso.actorPrincipal && (
                                <div className={styles.metaItem}>
                                    <User size={18} />
                                    <span><strong>Actor Principal:</strong> {caso.actorPrincipal}</span>
                                </div>
                            )}
                            {caso.fechaCampana && (
                                <div className={styles.metaItem}>
                                    <Calendar size={18} />
                                    <span><strong>Campaña:</strong> {formatDate(caso.fechaCampana)}</span>
                                </div>
                            )}
                        </div>

                        {imageUrl && (
                            <div className={styles.heroImageContainer}>
                                <Image
                                    src={imageUrl}
                                    alt={caso.imagenPortada?.alternativeText || caso.titulo}
                                    fill
                                    priority
                                    className={styles.heroImage}
                                    sizes="(max-width: 1200px) 100vw, 1200px"
                                />
                            </div>
                        )}
                    </header>

                    {caso.metricasLogradas && caso.metricasLogradas.length > 0 && (
                        <div className={styles.metricsBanner}>
                            <h3 className={styles.metricsTitle}>Resultados Clave</h3>
                            <div className={styles.metricsGrid}>
                                {caso.metricasLogradas.map(m => (
                                    <div key={m.id} className={styles.metricItem}>
                                        <div className={styles.metricValue}>{m.valor}</div>
                                        <div className={styles.metricLabel}>{m.etiqueta}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tarjetas de Crecimiento de YouTube En Vivo */}
                    {youtubeDataWithLiveStats.length > 0 && (
                        <div className={styles.youtubeGrowthSection}>
                            <h3 className={styles.youtubeTitle}>
                                <span className={styles.liveIndicator}></span>
                                Crecimiento en YouTube (En Vivo)
                            </h3>
                            <div className={styles.youtubeCardsGrid}>
                                {youtubeDataWithLiveStats.map(yt => (
                                    <div key={yt.id} className={styles.youtubeCard}>
                                        <div className={styles.ytCardHeader}>
                                            <div className={styles.ytIcon}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                                    <path d="M21.582 6.186a2.506 2.506 0 0 0-1.762-1.766C18.265 4 12 4 12 4s-6.264 0-7.82.42a2.505 2.505 0 0 0-1.762 1.766C2 7.74 2 12 2 12s0 4.26 .418 5.814a2.506 2.506 0 0 0 1.762 1.766C5.736 20 12 20 12 20s6.265 0 7.82-.42a2.506 2.506 0 0 0 1.762-1.766C22 16.26 22 12 22 12s0-4.26-.418-5.814zM9.993 15.195v-6.39l5.902 3.195-5.902 3.195z" />
                                                </svg>
                                            </div>
                                            <h4 className={styles.ytChannelName}>
                                                {yt.nombreOpcional || yt.liveStats?.title || "Canal de YouTube"}
                                            </h4>
                                        </div>

                                        <div className={styles.ytStatsGrid}>
                                            {yt.suscriptoresAntes && (
                                                <div className={styles.ytStatCol}>
                                                    <span className={styles.ytStatLabel}>Inicio Campaña</span>
                                                    <span className={styles.ytStatValueOld}>
                                                        {parseInt(yt.suscriptoresAntes).toLocaleString('es-ES')} sub
                                                    </span>
                                                </div>
                                            )}

                                            <div className={styles.ytStatCol}>
                                                <span className={styles.ytStatLabel}>Suscriptores</span>
                                                <span className={styles.ytStatValueNew}>
                                                    {yt.liveStats ? <AnimatedNumber value={yt.liveStats.subscriberCount} /> : "Error API"}
                                                </span>
                                            </div>

                                            {yt.porcentajeCrecimiento && (
                                                <div className={styles.ytGrowthBadge}>
                                                    {yt.porcentajeCrecimiento}
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.ytFooterMetrics}>
                                            {yt.liveStats?.viewCount !== undefined && (
                                                <div className={styles.ytTotalItem}>
                                                    Vistas Totales: <strong><AnimatedNumber value={yt.liveStats.viewCount} /></strong>
                                                </div>
                                            )}
                                            {yt.liveStats?.videoCount !== undefined && (
                                                <div className={styles.ytTotalItem}>
                                                    Videos Subidos: <strong><AnimatedNumber value={yt.liveStats.videoCount} /></strong>
                                                </div>
                                            )}
                                        </div>

                                        {yt.liveStats?.recentVideos && yt.liveStats.recentVideos.length > 0 && (
                                            <div className={styles.ytRecentVideos}>
                                                <h5 className={styles.ytRecentVideosTitle}>Últimos Videos Publicados</h5>
                                                <div className={styles.ytVideosList}>
                                                    {yt.liveStats.recentVideos.map((video: any) => (
                                                        <a
                                                            key={video.id}
                                                            href={`https://www.youtube.com/watch?v=${video.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.ytVideoItem}
                                                        >
                                                            {video.thumbnail && (
                                                                <div className={styles.ytVideoThumbnail}>
                                                                    <Image
                                                                        src={video.thumbnail}
                                                                        alt={video.title}
                                                                        fill
                                                                        className={styles.ytImg}
                                                                        unoptimized
                                                                    />
                                                                    <div className={styles.playIconOverlay}>
                                                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className={styles.ytVideoTitle} title={video.title}>{video.title}</div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.contentSection}>
                        <div className={styles.resumen}>
                            <strong>Resumen Ejecutivo:</strong> {caso.resumen}
                        </div>

                        {caso.contenidoCompleto && (
                            <div className={styles.richText}>
                                {typeof caso.contenidoCompleto === 'string' ? (
                                    <ReactMarkdown>{caso.contenidoCompleto}</ReactMarkdown>
                                ) : (
                                    <p>Este contenido está utilizando un formato antiguo o no soportado.</p>
                                )}
                            </div>
                        )}
                    </div>
                </article>
            </main>

            <Footer mode="b2b" />
        </div>
    );
}

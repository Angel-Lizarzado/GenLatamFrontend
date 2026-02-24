import Header from "@/components/Header/Header";
import { getConfiguracionGlobal, getExitCampana } from "@/lib/api";
import Footer from "@/components/Footer/Footer";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Headphones, ArrowUpRight, Mic, Star, Radio, Zap } from "lucide-react";
import styles from './page.module.css';

async function getRecentVideos(channelId: string) {
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) return { latest: null, list: [] };

    try {
        const liveSearchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`);
        let activeLiveVideoId = null;
        if (liveSearchResponse.ok) {
            const liveData = await liveSearchResponse.json();
            if (liveData.items && liveData.items.length > 0) {
                activeLiveVideoId = liveData.items[0].id.videoId;
            }
        }

        const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`, {
            next: { revalidate: 3600 }
        });

        if (!response.ok) return { latest: activeLiveVideoId, list: [] };

        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const uploadsPlaylistId = data.items[0].contentDetails?.relatedPlaylists?.uploads;

            if (uploadsPlaylistId) {
                const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=4&key=${apiKey}`, {
                    next: { revalidate: 3600 }
                });

                if (videosResponse.ok) {
                    const videosData = await videosResponse.json();
                    if (videosData.items) {
                        const list = videosData.items.map((item: any) => ({
                            id: item.snippet.resourceId.videoId,
                            title: item.snippet.title,
                            thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                            publishedAt: item.snippet.publishedAt
                        }));

                        const latestFallback = activeLiveVideoId ? activeLiveVideoId : (list.length > 0 ? list[0].id : null);
                        return { latest: latestFallback, list };
                    }
                }
            }
        }
        return { latest: activeLiveVideoId, list: [] };
    } catch {
        return { latest: null, list: [] };
    }
}

export default async function ExitPage() {
    const [configuracion, exitData] = await Promise.all([
        getConfiguracionGlobal(),
        getExitCampana().catch(() => null)
    ]);

    const EXIT_CHANNEL_ID = exitData?.youtubeChannelId || "UCPV-r3DqH8Eewz2-XoB40Kw"; // Fallback canal genérico de GenLatam
    const { latest: mainVideoId, list: recentVideos } = await getRecentVideos(EXIT_CHANNEL_ID);

    const anfitrion = exitData?.anfitrion;
    const invitadoEspecial = exitData?.invitadoEspecial;

    const renderBadgeIcon = () => {
        switch (exitData?.badgeIcono) {
            case 'Mic': return <Mic size={16} />;
            case 'Radio': return <Radio size={16} />;
            case 'Star': return <Star size={16} />;
            case 'PlayCircle': return <PlayCircle size={16} />;
            case 'Zap': return <Zap size={16} />;
            default: return <Headphones size={16} />;
        }
    };

    return (
        <div className={styles.exitWrapper}>
            <Header configuracion={configuracion} mode="b2c" title="EXIT" href="/exit" logo={exitData?.logo} />

            <main className={styles.container}>
                <section className={styles.podcastHero}>
                    <div className={styles.heroText}>
                        <div className={styles.badgeWrapper}>
                            <span className={styles.podcastBadge}>
                                {renderBadgeIcon()} {exitData?.badgeTexto || "PODCAST ORIGINAL"}
                            </span>
                        </div>
                        <h1 className={styles.title}>
                            {exitData?.tituloPrincipal || "EXIT: Entrevistas a Fondo"}
                        </h1>
                        <div className={styles.description} dangerouslySetInnerHTML={{ __html: exitData?.descripcion || "<p>Un espacio dedicado a las conversaciones incómodas, la verdad sin filtros y el análisis profundo. Acompáñanos en cada episodio.</p>" }} />

                        {/* Redes Sociales del Show (Antes plataformasEscucha) */}
                        {exitData?.redesSociales && exitData.redesSociales.length > 0 && (
                            <div className={styles.platforms}>
                                <h3 className={styles.platformsTitle}>Nuestras Redes:</h3>
                                <div className={styles.platformsList}>
                                    {exitData.redesSociales.map((plat: any) => (
                                        <a key={plat.id} href={plat.url} target="_blank" rel="noopener noreferrer" className={styles.platformLink}>
                                            {plat.plataforma} <ArrowUpRight size={14} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Banner Descriptivo Inferior del Invitado (Horizontal) */}
                        {invitadoEspecial && (
                            <div className={styles.upcomingGuestBanner}>
                                <div className={styles.upcomingLabel}>
                                    <Star size={16} /> PRÓXIMO INVITADO ESPECIAL
                                </div>
                                <div className={styles.guestBannerContent}>
                                    {invitadoEspecial?.fotoPerfil?.url ? (
                                        <div className={styles.guestImageWrapper}>
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337'}${invitadoEspecial.fotoPerfil.url}`}
                                                alt={invitadoEspecial.nombre}
                                                fill
                                                className={styles.guestImage}
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <div className={styles.guestPlaceholder}>
                                            <span>{invitadoEspecial.nombre ? invitadoEspecial.nombre.charAt(0).toUpperCase() : 'INV'}</span>
                                        </div>
                                    )}
                                    <div className={styles.guestInfo}>
                                        <div className={styles.guestHeader}>
                                            <span className={styles.guestRole}>{invitadoEspecial?.rol || "Invitado"}</span>
                                            <h3 className={styles.guestName}>{invitadoEspecial.nombre}</h3>
                                        </div>
                                        {invitadoEspecial?.bio && <p className={styles.guestBio}>{invitadoEspecial.bio}</p>}
                                        <div className={styles.hostSocials}>
                                            {invitadoEspecial?.enlaceX && <a href={invitadoEspecial.enlaceX} target="_blank" rel="noopener noreferrer">Twitter/X</a>}
                                            {invitadoEspecial?.enlaceInstagram && <a href={invitadoEspecial.enlaceInstagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contenedor de Perfiles */}
                    <div className={styles.hostsContainer}>
                        {/* Información del Anfitrión */}
                        {anfitrion && (
                            <div className={styles.hostCard}>
                                {anfitrion?.fotoPerfil?.url ? (
                                    <div className={styles.hostImageWrapper}>
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337'}${anfitrion.fotoPerfil.url}`}
                                            alt={anfitrion.nombre}
                                            fill
                                            className={styles.hostImage}
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.hostPlaceholder}>
                                        <span>{anfitrion?.nombre ? anfitrion.nombre.charAt(0).toUpperCase() : 'HOST'}</span>
                                    </div>
                                )}
                                <div className={styles.hostInfo}>
                                    <span className={styles.hostRole}>{anfitrion?.rol || "Presentador Principal"}</span>
                                    <h3 className={styles.hostName}>{anfitrion?.nombre || "Marfilipo"}</h3>
                                    {anfitrion?.bio && <p className={styles.hostBio}>{anfitrion.bio}</p>}
                                    <div className={styles.hostSocials}>
                                        {anfitrion?.enlaceX && <a href={anfitrion.enlaceX} target="_blank" rel="noopener noreferrer">Twitter/X</a>}
                                        {anfitrion?.enlaceInstagram && <a href={anfitrion.enlaceInstagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </section>

                {/* Container 2-Columns for Videos */}
                <div className={styles.dashboardGrid}>
                    <section className={styles.videoSection}>
                        <div className={styles.videoHeader}>
                            <h2><PlayCircle size={24} /> ÚLTIMO EPISODIO / EN VIVO</h2>
                        </div>

                        <div className={styles.videoWrapper}>
                            {mainVideoId ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${mainVideoId}?autoplay=0`}
                                    title="Episodio Podcast"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className={styles.iframe}
                                ></iframe>
                            ) : (
                                <div className={styles.placeholderVideo}>Espere nueva transmisión de EXIT</div>
                            )}
                        </div>
                    </section>

                    <aside className={styles.recentList}>
                        <div className={styles.videoHeader}>
                            <h2>Últimos Episodios</h2>
                        </div>
                        <div className={styles.videoListParams}>
                            {recentVideos.length > 0 ? recentVideos.map((video: any) => (
                                <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" key={video.id} className={styles.videoListItem}>
                                    <div className={styles.vListThumb}>
                                        <Image src={video.thumbnail} alt={video.title} fill unoptimized />
                                    </div>
                                    <div className={styles.vListInfo}>
                                        <h4>{video.title}</h4>
                                        <span className={styles.vListDate}>{new Date(video.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                </a>
                            )) : (
                                <div className={styles.placeholderVideo}>Buscando historial...</div>
                            )}
                        </div>
                    </aside>
                </div>
            </main>

            <Footer mode="b2c" logo={exitData?.logo} />
        </div>
    );
}

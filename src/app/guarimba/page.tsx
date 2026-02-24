import Header from "@/components/Header/Header";
import { getConfiguracionGlobal, getHubComunidad } from "@/lib/api";
import Footer from "@/components/Footer/Footer";
import Image from "next/image";
import Link from "next/link";
import { Terminal, Radio, ShieldAlert, Cpu } from "lucide-react";
import styles from './page.module.css';

async function getRecentVideos(channelId: string) {
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) return { latest: null, list: [] };

    try {
        // First check for active live broadcast
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

                        // If no live video is found, set the latest video dynamically from the list
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

export default async function GuarimbaPage() {
    const [configuracion, hubData] = await Promise.all([
        getConfiguracionGlobal(),
        getHubComunidad()
    ]);

    // Fetch the recent videos and dynamic active video
    const GUARIMBA_CHANNEL_ID = hubData?.youtubeChannelId || "UC3z7HqxEeJQuE74XYj0g1Mw";
    const { latest: dynamicMainVideoId, list: recentVideos } = await getRecentVideos(GUARIMBA_CHANNEL_ID);

    // Filter community networks from Hub instead of Config
    const redes = hubData?.redesComunidad || [];

    const mainVideoId = dynamicMainVideoId; // Ya no usa videoPrincipalUrl

    return (
        <div className={styles.hackerWrapper}>
            <Header configuracion={configuracion} mode="b2c" title="Guarimba" href="/guarimba" logo={hubData?.logo} />

            <main className={styles.container}>
                <div className={styles.noiseOverlay}></div>

                {/* Status Bar */}
                <div className={styles.statusBar}>
                    <div className={styles.statusBlinking}><Radio size={14} /> GENERACIÓN_INDEPENDENCIA</div>
                    <div className={styles.statusData}>SEÑAL: SEGURA // SISTEMA: EN LÍNEA // INFO: ACTUALIZADA</div>
                    <div className={styles.statusTime}>{new Date().toISOString().split('T')[0]} - TERMINAL_GDB</div>
                </div>

                <section className={styles.heroContent}>
                    <h1 className={styles.title}>
                        <Terminal size={48} className={styles.titleIcon} />
                        {hubData?.tituloPrincipal || "LA RESISTENCIA AVANZA"}
                    </h1>
                    <p className={styles.message}>
                        {hubData?.mensajeComunidad || "Uniendo voces por la libertad civil y la transparencia en cada rincón de Latinoamérica. Sistema de difusión descentralizado."}
                    </p>

                    {hubData?.mostrarBotonApoyo && hubData?.linkBotonApoyo && (
                        <a
                            href={hubData.linkBotonApoyo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.supportBtn}
                        >
                            <ShieldAlert size={18} />
                            {hubData.textoBotonApoyo || "APOYAR OPERACIÓN"}
                        </a>
                    )}
                </section>

                {/* Presentadores e Invitado Especial */}
                <div className={styles.hostsSection}>
                    <div className={styles.hostsContainer}>
                        {/* Presentadores Principales */}
                        {hubData?.perfilesPresentadores && hubData.perfilesPresentadores.length > 0 && hubData.perfilesPresentadores.map(presentador => (
                            <div key={presentador.id} className={styles.hostCard}>
                                {presentador?.fotoPerfil?.url ? (
                                    <div className={styles.hostImageWrapper}>
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337'}${presentador.fotoPerfil.url}`}
                                            alt={presentador.nombre}
                                            fill
                                            className={styles.hostImage}
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.hostPlaceholder}>
                                        <span>{presentador.nombre ? presentador.nombre.charAt(0).toUpperCase() : 'HOST'}</span>
                                    </div>
                                )}
                                <div className={styles.hostInfo}>
                                    <span className={styles.hostRole}>_ {presentador?.rol || "Presentador"}</span>
                                    <h3 className={styles.hostName}>{presentador.nombre}</h3>
                                    {presentador?.bio && <p className={styles.hostBio}>{presentador.bio}</p>}
                                    <div className={styles.hostSocials}>
                                        {presentador?.enlaceX && <a href={presentador.enlaceX} target="_blank" rel="noopener noreferrer">X / TWITTER</a>}
                                        {presentador?.enlaceInstagram && <a href={presentador.enlaceInstagram} target="_blank" rel="noopener noreferrer">INSTAGRAM</a>}
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                    {/* Tarjeta Horizontal del Invitado Especial */}
                    {hubData?.invitadoEspecial && (
                        <div className={styles.guestTerminalCard}>
                            <div className={styles.guestTerminalHeader}>
                                <span className={styles.guestTerminalLabel}>[ NEW_CONNECTION ]</span>
                                <span className={styles.guestTerminalRole}>&gt; {hubData.invitadoEspecial?.rol || "INVITADO_ESPECIAL"}</span>
                            </div>
                            <div className={styles.guestTerminalContent}>
                                {hubData.invitadoEspecial?.fotoPerfil?.url ? (
                                    <div className={styles.guestTerminalImageWrapper}>
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337'}${hubData.invitadoEspecial.fotoPerfil.url}`}
                                            alt={hubData.invitadoEspecial.nombre}
                                            fill
                                            className={styles.hostImage}
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.guestTerminalPlaceholder}>
                                        <span>{hubData.invitadoEspecial.nombre ? hubData.invitadoEspecial.nombre.charAt(0).toUpperCase() : 'INV'}</span>
                                    </div>
                                )}
                                <div className={styles.guestTerminalInfo}>
                                    <h3 className={styles.guestTerminalName}>{hubData.invitadoEspecial.nombre}</h3>
                                    {hubData.invitadoEspecial?.bio && <p className={styles.guestTerminalBio}>{hubData.invitadoEspecial.bio}</p>}
                                    <div className={styles.hostSocials}>
                                        {hubData.invitadoEspecial?.enlaceX && <a href={hubData.invitadoEspecial.enlaceX} target="_blank" rel="noopener noreferrer">X / TWITTER</a>}
                                        {hubData.invitadoEspecial?.enlaceInstagram && <a href={hubData.invitadoEspecial.enlaceInstagram} target="_blank" rel="noopener noreferrer">INSTAGRAM</a>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.dashboardGrid}>
                    {/* Left Column: Communications Hub */}
                    <div className={styles.leftCol}>
                        <div className={styles.panelBox}>
                            <h3 className={styles.panelTitle}><Cpu size={18} /> Nodos Frecuencia Aliada</h3>
                            <div className={styles.networksGrid}>
                                {redes.length > 0 ? redes.map(red => (
                                    <a key={red.id} href={red.url} target="_blank" rel="noopener noreferrer" className={styles.networkNode}>
                                        <span className={styles.networkLabel}>[ {red.plataforma.toUpperCase()} ]</span>
                                        <span className={styles.networkLink}>Conectar</span>
                                    </a>
                                )) : (
                                    <div className={styles.systemMsg}>&gt; INICIANDO NODOS... NINGUNA RED CONFIGURADA EN STRAPI_</div>
                                )}
                            </div>
                        </div>

                        {/* Recent Videos List */}
                        <div className={styles.panelBox}>
                            <h3 className={styles.panelTitle}><Radio size={18} /> Transmisiones Recientes</h3>
                            <div className={styles.videoList}>
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
                                    <div className={styles.systemMsg}>&gt; AWAITING SATELLITE UPLINK...</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Main Broadcast */}
                    <div className={styles.rightCol}>
                        <div className={`${styles.panelBox} ${styles.monitorBox}`}>
                            <div className={styles.monitorHeader}>
                                <span className={styles.monitorLabel}>// VIDEO_PRIMARIO</span>
                                <span className={styles.monitorRec}>● REC</span>
                            </div>
                            <div className={styles.mediaSection}>
                                {mainVideoId ? (
                                    <div className={styles.videoWrapper}>
                                        <iframe
                                            src={`https://www.youtube.com/embed/${mainVideoId}?autoplay=1&mute=1`}
                                            title="Main Broadcast"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className={styles.iframe}
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className={styles.placeholderVideo}>
                                        <p>&gt; ESPERANDO TRANSMISIÓN SATELITAL...</p>
                                        <span className={styles.blinkingSquare}></span>
                                    </div>
                                )}
                            </div>
                            <div className={styles.monitorFooter}>
                                ENCRYPTION: AES-256 | STATUS: BROADCASTING
                            </div>
                        </div>
                    </div>
                </div>

                {/* Banner Activo Global */}
                {configuracion?.bannerActivo && configuracion?.bannerTexto && (
                    <div className={styles.globalAlertTicker}>
                        <div className={styles.tickerContent}>
                            ALERT SYSTEM: {configuracion.bannerTexto} // ALERT SYSTEM: {configuracion.bannerTexto} //
                        </div>
                    </div>
                )}
            </main>

            <Footer mode="b2c" logo={hubData?.logo} />
        </div>
    );
}

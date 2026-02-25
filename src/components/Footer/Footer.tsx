import Link from "next/link";
import styles from "./Footer.module.css";
import { Youtube, Twitter, Instagram, Linkedin, MessageCircle, Phone } from "lucide-react";
import { getConfiguracionGlobal, getStrapiMedia } from "@/lib/api";

interface FooterProps {
    mode?: 'b2b' | 'b2c';
    logo?: {
        url: string;
        width: number;
        height: number;
        alternativeText: string | null;
    } | null;
}

export default async function Footer({ mode = 'b2b', logo }: FooterProps) {
    const isB2C = mode === 'b2c';
    const configuracion = await getConfiguracionGlobal();

    const redes = isB2C ? configuracion?.redesComunidad : configuracion?.redesCorporativas;
    const finalLogo = logo || configuracion?.logo;

    const getIcon = (plataforma: string) => {
        switch (plataforma) {
            case 'YouTube': return <Youtube size={20} />;
            case 'X': return <Twitter size={20} />;
            case 'Instagram': return <Instagram size={20} />;
            case 'LinkedIn': return <Linkedin size={20} />;
            case 'TikTok': return <span style={{ fontWeight: 800 }}>t</span>; // Simplified fallback
            case 'Telegram': return <MessageCircle size={20} />;
            case 'WhatsApp': return <Phone size={20} />;
            default: return <MessageCircle size={20} />;
        }
    };

    return (
        <footer className={`${styles.footer} ${isB2C ? styles.b2cFooter : styles.b2bFooter}`}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.brandSection}>
                        <h3 className={styles.brandName}>
                            {finalLogo?.url ? (
                                <img
                                    src={getStrapiMedia(finalLogo.url)!}
                                    alt={isB2C ? "GUARIMBA DIGITAL" : "GenLatam."}
                                    style={{ maxHeight: '50px', width: 'auto', marginBottom: '1rem' }}
                                />
                            ) : (
                                isB2C ? "GUARIMBA DIGITAL" : "GenLatam."
                            )}
                        </h3>
                        <p className={styles.description}>
                            {isB2C
                                ? "Señal activa. Construyendo ecosistemas digitales para la resistencia y la defensa de la libertad."
                                : (configuracion?.textoFooter || "Consultoría estratégica y posicionamiento corporativo de alto nivel.")}
                        </p>

                        {redes && redes.length > 0 && (
                            <div className={styles.socialNetworks}>
                                {redes.map(red => (
                                    <a key={red.id} href={red.url} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label={red.plataforma}>
                                        {getIcon(red.plataforma)}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.linksSection}>
                        <h4 className={styles.sectionTitle}>Navegación</h4>
                        <ul className={styles.linkList}>
                            {isB2C ? (
                                <>
                                    <li><Link href="/guarimba">Guarimba</Link></li>
                                    <li><Link href="/exit">Entrevistas en EXIT</Link></li>
                                    <li><Link href="/" className={styles.backLink}>← Volver al inicio</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link href="/">Inicio</Link></li>
                                    <li><Link href="/servicios">Oficina de Estrategia</Link></li>
                                    <li><Link href="/casos">Portafolio Profesional</Link></li>
                                    <li><Link href="/contacto">Contacto</Link></li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <p className={styles.copyright}>
                        &copy; {new Date().getFullYear()} {isB2C ? "Red de Resistencia" : "GenLatam"}. Todos los derechos reservados.
                    </p>
                    <p className={styles.manifesto}>
                        <span className={styles.hashtag}>#GeneracionIndependencia</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}

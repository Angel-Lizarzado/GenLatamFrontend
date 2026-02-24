import Header from "@/components/Header/Header";
import { getConfiguracionGlobal } from "@/lib/api";
import styles from './page.module.css';
import Link from "next/link";
import { Mail, Phone, MapPin, ExternalLink, Send, MessageSquare } from "lucide-react";
import Footer from "@/components/Footer/Footer";
import ContactForm from "./ContactForm";

export default async function ContactoPage() {
    const configuracion = await getConfiguracionGlobal();

    const email = configuracion?.emailContactoB2B || "contacto@genlatam.com";
    const phone = configuracion?.telefonoB2B || "+1 (555) 000-0000";

    return (
        <div className={styles.pageWrapper}>
            <Header configuracion={configuracion} mode="b2b" />

            <main className={styles.container}>
                <div className={styles.contentWrapper}>
                    <div className={styles.infoCol}>
                        <h1 className={styles.title}>Iniciar Conversación</h1>
                        <p className={styles.subtitle}>
                            Nuestro equipo evalúa cada consulta con estricta confidencialidad. Ya sea para escalar una marca corporativa o gestionar una crisis de reputación, estamos listos para intervenir.
                        </p>

                        <div className={styles.contactMethods}>
                            <a href={`mailto:${email}`} className={styles.methodCard}>
                                <div className={styles.methodIcon}><Mail size={24} /></div>
                                <div>
                                    <span className={styles.methodLabel}>Email Directo</span>
                                    <strong className={styles.methodValue}>{email}</strong>
                                </div>
                            </a>

                            <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className={styles.methodCard}>
                                <div className={styles.methodIcon}><Phone size={24} /></div>
                                <div>
                                    <span className={styles.methodLabel}>Línea Ejecutiva</span>
                                    <strong className={styles.methodValue}>{phone}</strong>
                                </div>
                            </a>

                            <div className={styles.methodCard}>
                                <div className={styles.methodIcon}><MapPin size={24} /></div>
                                <div>
                                    <span className={styles.methodLabel}>Sede Global</span>
                                    <strong className={styles.methodValue}>Operaciones remotas LATAM / US</strong>
                                </div>
                            </div>
                        </div>

                        {configuracion?.redesCorporativas && configuracion.redesCorporativas.length > 0 && (
                            <div className={styles.socialSection}>
                                <h3 className={styles.socialTitle}>Redes Corporativas</h3>
                                <div className={styles.socialGrid}>
                                    {configuracion.redesCorporativas.map((red) => (
                                        <a key={red.id} href={red.url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                                            {red.plataforma} <ExternalLink size={14} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.formCol}>
                        <ContactForm email={email} />
                    </div>
                </div>
            </main>
            <Footer mode="b2b" />
        </div>
    );
}

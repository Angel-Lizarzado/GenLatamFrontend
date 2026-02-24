import Header from "@/components/Header/Header";
import { getConfiguracionGlobal, getPaginaServicios } from "@/lib/api";
import styles from './page.module.css';
import Link from "next/link";
import { ArrowRight, BarChart3, Presentation, Users, Megaphone, Smartphone, Globe, Activity, Zap, Shield, Star, TrendingUp, Target } from "lucide-react";
import Footer from "@/components/Footer/Footer";

const ICON_MAP: Record<string, React.ElementType> = {
    Presentation, Globe, BarChart3, Activity, Zap, Shield, Smartphone, Megaphone, Star, Users, TrendingUp, Target
};

export default async function ServiciosPage() {
    // Parallel fetching for performance
    const [configuracion, paginaServicios] = await Promise.all([
        getConfiguracionGlobal(),
        getPaginaServicios()
    ]);

    // Fallbacks if Strapi hasn't been set up yet
    const data = paginaServicios || {
        etiquetaHero: "Experiencia B2B",
        tituloHero: "Consultoría Estratégica & Medios",
        subtituloHero: "Soluciones especializadas para corporaciones, figuras públicas y marcas que buscan dominar su nicho de mercado con autoridad narrativa.",
        servicios: [],
        tituloCta: "¿Un caso especial de Alta Complejidad?",
        descripcionCta: "Evaluamos proyectos de gran escala, crisis mediática y estrategias de penetración de mercado a nivel Latam.",
        textoBotonCta: "Hablar con un Socio",
        urlBotonCta: "/contacto"
    };

    return (
        <div className={styles.pageWrapper}>
            <Header configuracion={configuracion} mode="b2b" />

            <main className={styles.container}>
                <header className={styles.header}>
                    <span className={styles.badge}>{data.etiquetaHero}</span>
                    <h1 className={styles.title}>{data.tituloHero}</h1>
                    <p className={styles.subtitle}>{data.subtituloHero}</p>
                </header>

                <div className={styles.grid}>
                    {data.servicios.length > 0 ? data.servicios.map((s) => {
                        const Icon = ICON_MAP[s.icono] || Presentation;
                        return (
                            <div key={s.id} className={styles.card}>
                                <div className={styles.iconContainer}>
                                    <Icon size={32} />
                                </div>
                                <h3 className={styles.cardTitle}>{s.titulo}</h3>
                                <p className={styles.cardDesc}>{s.descripcion}</p>

                                <Link href="/contacto" className={styles.cardLink}>
                                    Solicitar auditoría <ArrowRight size={16} />
                                </Link>
                            </div>
                        );
                    }) : (
                        <div className={styles.emptyState}>
                            No hay servicios configurados en Strapi actualmente. Configure el apartado "Página de Servicios".
                        </div>
                    )}
                </div>

                <div className={styles.ctaSection}>
                    <h2 className={styles.ctaTitle}>{data.tituloCta}</h2>
                    <p className={styles.ctaDesc}>{data.descripcionCta}</p>
                    <Link href={data.urlBotonCta} className={styles.btnPrimary}>
                        {data.textoBotonCta} <ArrowRight size={18} />
                    </Link>
                </div>
            </main>
            <Footer mode="b2b" />
        </div>
    );
}

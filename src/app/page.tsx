import Header from "@/components/Header/Header";
import HeroB2B from "@/components/HeroB2B/HeroB2B";
import { getConfiguracionGlobal, getHomeB2B, getCasosDeExito } from "@/lib/api";
import Link from "next/link";
import { ArrowRight, BarChart3, Presentation, Globe, Activity, Zap, Shield, Smartphone, Megaphone, Star, Users, TrendingUp, Target } from "lucide-react";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/api";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

export default async function Home() {
  // Parallel fetching from Strapi
  const [configuracion, homeB2B, allCasos] = await Promise.all([
    getConfiguracionGlobal(),
    getHomeB2B(),
    getCasosDeExito()
  ]);

  // Tomamos solo los 3 casos más recientes o destacados para el Home
  const casosDestacados = allCasos.slice(0, 3);

  return (
    <div className={styles.pageWrapper}>
      <Header configuracion={configuracion} mode="b2b" />
      <main>
        {/* Dynamic Hero Section fetched from Strapi */}
        <HeroB2B data={homeB2B} />

        {/* Sección de Imperio Mediático Oficial (NEW) */}
        <section className={styles.mediaEmpireSection}>
          <div className={styles.container}>
            <div className={styles.empireHeader}>
              <span className={styles.empireBadge}>{homeB2B?.etiquetaSeccionMedios || 'Network Oficial'}</span>
              <h2 className={styles.empireTitle}>{homeB2B?.tituloSeccionMedios || 'Ecosistema de Influencia Propio'}</h2>
              <p className={styles.empireSubtitle}>{homeB2B?.parrafoSeccionMedios || 'No solo asesoramos; construimos y operamos algunas de las comunidades políticas más ruidosas de Latam.'}</p>
            </div>

            <div className={styles.empireGrid}>
              <div className={styles.empireChannel}>
                <div className={styles.channelLogoWrapper}>
                  {/* Simulando logos temporalmente */}
                  <div className={styles.mockLogo} style={{ background: 'linear-gradient(135deg, #111, #333)', color: '#fff' }}>G</div>
                </div>
                <h3>Guarimba Digital Bowery</h3>
                <p>El hub de contrainformación y activismo venezolano con mayor engagement sostenido.</p>
                <Link href={homeB2B?.urlBotonGuarimba || "/guarimba"} className={styles.channelLink}>
                  {homeB2B?.textoBotonGuarimba || "Ver Plataforma"} <ArrowRight size={14} />
                </Link>
              </div>

              <div className={styles.empireChannel}>
                <div className={styles.channelLogoWrapper}>
                  <div className={styles.mockLogo} style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)', color: '#fff' }}>E</div>
                </div>
                <h3>Campaña EXIT</h3>
                <p>Movimiento estratégico de alto impacto para la movilización y organización civil.</p>
                <Link href={homeB2B?.urlLinkExit || "#"} className={styles.channelLink}>
                  {homeB2B?.textoLinkExit || "Caso de Estudio Próximamente"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Servicios Destacados (Redesigned Glassmorphic) */}
        <section className={`${styles.homeSection} ${styles.altBackground}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Nuestras Capacidades</h2>
              <p className={styles.sectionSubtitle}>Estructuras digitales de alto impacto para negocios que requieren liderazgo en su industria.</p>
            </div>

            <div className={styles.servicesGrid}>
              {homeB2B?.capacidades?.map((capacidad) => {
                const iconsMap: any = {
                  Presentation, Globe, BarChart3, Activity, Zap, Shield, Smartphone, Megaphone, Star, Users, TrendingUp, Target
                };
                const Icon = iconsMap[capacidad.icono] || Globe;

                return (
                  <div key={capacidad.id} className={styles.serviceCard}>
                    <div className={styles.serviceIconWrapper}><Icon size={28} /></div>
                    <h3>{capacidad.titulo}</h3>
                    <p>{capacidad.descripcion}</p>
                  </div>
                );
              })}
            </div>

            <div className={styles.centerAction}>
              <Link href="/servicios" className={styles.btnOutline}>
                Ver Oferta Completa <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Sección de Casos de Éxito Embebida (Editorial Bento Layout) */}
        {casosDestacados.length > 0 && (
          <section className={styles.homeSection}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <span className={styles.empireBadge}>Resultados Verificables</span>
                <h2 className={styles.sectionTitle}>Portafolio B2B</h2>
                <p className={styles.sectionSubtitle}>Campañas ejecutadas con precisión milimétrica donde el margen de error es cero.</p>
              </div>

              <div className={styles.casosBentoGrid}>
                {casosDestacados.map((caso) => (
                  <Link href={`/casos/${caso.slug}`} key={caso.id} className={styles.casoCard}>
                    <div className={styles.casoImageContainer}>
                      {caso.imagenPortada?.url ? (
                        <Image
                          src={getStrapiMedia(caso.imagenPortada.url) || ''}
                          alt={caso.titulo}
                          fill
                          className={styles.casoImage}
                        />
                      ) : (
                        <div className={styles.placeholderImage}>GenLatam</div>
                      )}
                      <div className={styles.casoGradientOverlay}></div>
                    </div>

                    <div className={styles.casoContent}>
                      <h4 className={styles.casoTitle}>{caso.titulo}</h4>
                      <p className={styles.casoResumen}>{caso.resumen}</p>

                      <div className={styles.casoFooter}>
                        <span className={styles.readMore}>Analizar <ArrowRight size={14} /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className={styles.centerAction}>
                <Link href="/casos" className={styles.btnPrimary}>
                  Ver Todo el Portafolio
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Premium Call to Action Final */}
        <section className={styles.premiumCta}>
          <div className={styles.ctaGlow}></div>
          <div className={styles.container}>
            <div className={styles.finalCtaContent}>
              <h2 className={styles.finalCtaTitle}>¿Listo para tomar el control de la narrativa?</h2>
              <p className={styles.finalCtaSubtitle}>Agenda una auditoría confidencial. Evaluaremos el peso actual de tu marca corporativa y diseñaremos la ruta exacta de escalabilidad comunicacional.</p>
              <Link href="/contacto" className={styles.btnGlow}>
                Iniciar Crecimiento <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* Hint Comunitario */}
        <div className={styles.communityHint}>
          <p>
            ¿Buscas nuestro lado activista social? Visita el <strong><Link href="/guarimba">Portal Guarimba Digital</Link></strong>.
          </p>
        </div>
      </main>
      <Footer mode="b2b" />
    </div>
  );
}

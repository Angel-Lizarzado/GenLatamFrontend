import qs from 'qs';

export function getStrapiURL(path = '') {
    return `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337'}${path}`;
}

export function getStrapiMedia(url: string | null) {
    if (url == null) {
        return null;
    }
    if (url.startsWith('http') || url.startsWith('//')) {
        return url;
    }
    return `${getStrapiURL()}${url}`;
}

export async function fetchAPI(path: string, urlParamsObject = {}, options = {}) {
    try {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Añadir token si se defiene en las variables de entorno para endpoints no públicos
        if (process.env.STRAPI_API_TOKEN) {
            // @ts-ignore
            defaultOptions.headers['Authorization'] = `Bearer ${process.env.STRAPI_API_TOKEN}`;
        }

        const mergedOptions = {
            ...defaultOptions,
            ...options,
        };

        const queryString = qs.stringify(urlParamsObject, {
            encodeValuesOnly: true, // embellece las URLs haciéndolas legibles
        });

        const requestUrl = `${getStrapiURL(`/api${path}${queryString ? `?${queryString}` : ''}`)}`;
        const response = await fetch(requestUrl, mergedOptions);

        if (!response.ok) {
            console.error(response.statusText);
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error interconectando con Strapi:", error);
        throw new Error(`Por favor verifica si tu servidor Strapi está corriendo (http://localhost:1337)`);
    }
}

// --- TIPOS DE DATOS ---

export interface EnlaceSocial {
    id: number;
    plataforma: 'YouTube' | 'X' | 'Instagram' | 'LinkedIn' | 'TikTok' | 'Telegram' | 'WhatsApp';
    url: string;
}

export interface ConfiguracionGlobal {
    emailContactoB2B: string | null;
    telefonoB2B: string | null;
    linkSoporteComunidad: string | null;
    canalYoutubePrincipal: string | null;
    redesCorporativas: EnlaceSocial[];
    redesComunidad: EnlaceSocial[];
    bannerActivo: boolean | null;
    bannerTexto: string | null;
    textoFooter?: string;
    logo?: {
        url: string;
        width: number;
        height: number;
        alternativeText: string | null;
    } | null;
}

export async function getConfiguracionGlobal(): Promise<ConfiguracionGlobal | null> {
    try {
        const query = {
            populate: '*',
        };
        const response = await fetchAPI('/configuracion-global', query, {
            next: {
                revalidate: 30, // ISR cada 30 segundos
                tags: ['configuracion-global']
            }
        });

        return response?.data || null;
    } catch {
        // En caso de que Strapi esté caído, devolver null y que el UI lo maneje graciosamente
        return null;
    }
}

export interface Metrica {
    id: number;
    valor: string;
    etiqueta: string;
}

export interface ServicioDestacado {
    id: number;
    titulo: string;
    descripcion: string;
    icono: string;
}

export interface HomeB2B {
    heroTitulo: string;
    heroSubtitulo: string;
    heroCtaTexto: string;
    heroCtaUrl: string;
    metricasDestacadas: Metrica[];
    capacidades?: ServicioDestacado[];
    etiquetaSeccionMedios?: string;
    tituloSeccionMedios?: string;
    parrafoSeccionMedios?: string;
    textoBotonGuarimba?: string;
    urlBotonGuarimba?: string;
    textoLinkExit?: string;
    urlLinkExit?: string;
    fondoHome?: {
        url: string;
        width: number;
        height: number;
        alternativeText: string | null;
    } | null;
    colorFondoHome?: string;
}

export async function getHomeB2B(): Promise<HomeB2B | null> {
    try {
        const query = {
            populate: '*',
        };
        const response = await fetchAPI('/home-b2b', query, {
            next: {
                revalidate: 30, // ISR cada 30 segundos
                tags: ['home-b2b']
            }
        });

        return response?.data || null;
    } catch {
        return null; // Graceful fallback
    }
}

export interface PerfilPresentador {
    id: number;
    nombre: string;
    rol: string;
    bio: string | null;
    fotoPerfil: {
        url: string;
        width: number;
        height: number;
        alternativeText: string | null;
    } | null;
    enlaceX: string | null;
    enlaceInstagram: string | null;
}

export interface HubComunidad {
    tituloPrincipal: string;
    mensajeComunidad: string;
    youtubeChannelId: string;
    redesComunidad?: EnlaceSocial[];
    mostrarBotonApoyo: boolean;
    textoBotonApoyo: string;
    linkBotonApoyo?: string;
    perfilesPresentadores?: PerfilPresentador[];
    invitadoEspecial?: PerfilPresentador;
    logo?: {
        url: string;
        width: number;
        height: number;
        alternativeText: string | null;
    } | null;
}

export async function getHubComunidad(): Promise<HubComunidad | null> {
    try {
        const query = {
            populate: [
                'perfilesPresentadores.fotoPerfil',
                'redesComunidad',
                'logo',
                'invitadoEspecial.fotoPerfil'
            ],
        };
        const response = await fetchAPI('/hub-comunidad', query, {
            next: {
                revalidate: 30,
                tags: ['hub-comunidad']
            }
        });

        return response?.data || null;
    } catch {
        return null;
    }
}

export interface ExitCampana {
    tituloPrincipal: string;
    badgeTexto?: string;
    badgeIcono?: 'Headphones' | 'Mic' | 'Radio' | 'Star' | 'PlayCircle' | 'Zap';
    descripcion: string;
    youtubeChannelId: string;
    anfitrion?: PerfilPresentador;
    invitadoEspecial?: PerfilPresentador;
    redesSociales?: EnlaceSocial[];
    logo?: {
        url: string;
        width: number;
        height: number;
        alternativeText: string | null;
    } | null;
}

export async function getExitCampana(): Promise<ExitCampana | null> {
    try {
        const query = {
            populate: [
                'anfitrion.fotoPerfil',
                'redesSociales',
                'logo',
                'invitadoEspecial.fotoPerfil'
            ],
        };
        const response = await fetchAPI('/exit-campana', query, {
            next: {
                revalidate: 30,
                tags: ['exit-campana']
            }
        });
        return response?.data || null;
    } catch {
        return null;
    }
}

export interface PaginaServicios {
    etiquetaHero: string;
    tituloHero: string;
    subtituloHero: string;
    servicios: {
        id: number;
        titulo: string;
        descripcion: string;
        icono: 'Presentation' | 'Globe' | 'BarChart3' | 'Activity' | 'Zap' | 'Shield' | 'Smartphone' | 'Megaphone' | 'Star' | 'Users' | 'TrendingUp' | 'Target';
    }[];
    tituloCta: string;
    descripcionCta: string;
    textoBotonCta: string;
    urlBotonCta: string;
}

export async function getPaginaServicios(): Promise<PaginaServicios | null> {
    try {
        const query = {
            populate: ['servicios'],
        };
        const response = await fetchAPI('/pagina-servicios', query, {
            next: {
                revalidate: 30, // Refresca caché cada 30 segundos
                tags: ['pagina-servicios']
            }
        });

        return response?.data || null;
    } catch {
        return null;
    }
}

export interface CasoDeExito {
    id: number;
    documentId: string;
    titulo: string;
    slug: string;
    resumen: string;
    actorPrincipal: string | null;
    fechaCampana: string | null;
    contenidoCompleto: any; // Block content rich-text en Strapi 5
    metricasLogradas: Metrica[];
    crecimientoYoutube: {
        id: number;
        nombreOpcional: string | null;
        youtubeChannelId: string;
        suscriptoresAntes: string | null;
    }[];
    imagenPortada: {
        url: string;
        width: number;
        height: number;
        alternativeText: string | null;
    } | null;
    destacadoEnHome: boolean | null;
}

export async function getCasosDeExito(): Promise<CasoDeExito[]> {
    try {
        const query = {
            populate: '*',
            sort: ['fechaCampana:desc'],
        };
        const response = await fetchAPI('/caso-de-exitos', query, {
            next: {
                revalidate: 60,
                tags: ['casos-de-exito']
            }
        });

        return response?.data || [];
    } catch {
        return [];
    }
}

export async function getCasoDeExitoBySlug(slug: string): Promise<CasoDeExito | null> {
    try {
        const query = {
            filters: {
                slug: {
                    $eq: slug,
                },
            },
            populate: '*',
        };
        const response = await fetchAPI('/caso-de-exitos', query, {
            next: {
                revalidate: 60,
                tags: ['casos-de-exito', `caso-${slug}`]
            }
        });

        return response?.data?.[0] || null;
    } catch {
        return null;
    }
}

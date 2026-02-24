'use client';
import { useState } from 'react';
import styles from './page.module.css';

export default function ContactForm({ email }: { email: string }) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({ nombre: '', empresa: '', email: '', mensaje: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337'}/api/contacto/enviar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setStatus('success');
                setFormData({ nombre: '', empresa: '', email: '', mensaje: '' });
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <form className={styles.contactForm} onSubmit={handleSubmit}>
            <h2 className={styles.formTitle}>Solicitud de Auditoría</h2>

            {status === 'success' && <div className={styles.successMessage}>Mensaje enviado exitosamente. Nos comunicaremos contigo pronto.</div>}
            {status === 'error' && <div className={styles.errorMessage}>Ocurrió un error al enviar tu mensaje. Por favor, intenta de nuevo o escríbenos directamente a {email}.</div>}

            <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Nombre o Representante</label>
                <input required type="text" id="name" className={styles.input} placeholder="Ingresa tu nombre..." value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} disabled={status === 'loading'} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="company" className={styles.label}>Empresa / Entidad</label>
                <input type="text" id="company" className={styles.input} placeholder="¿A qué empresa representas?" value={formData.empresa} onChange={e => setFormData({ ...formData, empresa: e.target.value })} disabled={status === 'loading'} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Correo Corporativo</label>
                <input required type="email" id="email" className={styles.input} placeholder="nombre@tuempresa.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled={status === 'loading'} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>Resumen del Caso</label>
                <textarea required id="message" rows={5} className={styles.textarea} placeholder="Describe brevemente la situación o el objetivo a alcanzar..." value={formData.mensaje} onChange={e => setFormData({ ...formData, mensaje: e.target.value })} disabled={status === 'loading'}></textarea>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
                {status === 'loading' ? 'Enviando...' : 'Enviar Mensaje Prioritario'}
            </button>
            <p className={styles.formDisclaimer}>
                * Al enviar este formulario, aceptas que GenLatam procese estos datos para evaluar el caso.
                Las solicitudes serán procesadas a través del equipo en <strong>{email}</strong>
            </p>
        </form>
    );
}

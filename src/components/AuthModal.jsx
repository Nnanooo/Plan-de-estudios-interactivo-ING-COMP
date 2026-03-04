import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';
import ReCAPTCHA from "react-google-recaptcha";
import './AuthModal.css';

const AuthModal = ({ onClose, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [dni, setDni] = useState('');
    const [pin, setPin] = useState('');
    const [nombre, setNombre] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Estado para Captcha Real
    const [captchaVerified, setCaptchaVerified] = useState(false);

    // Creamos un email ficticio para cumplir con Supabase Auth
    const getSyntheticEmail = (userDni) => `${userDni}@plan.dinamico.com`;
    // Aseguramos una contraseña que cumpla con los estándares de Supabase (mínimo 6 chars)
    const getSecurePassword = (userPin) => `pin_${userPin}_unse`;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!dni || !pin) {
            toast.error('Garantiza ingresar DNI y PIN.');
            return;
        }

        if (dni.length > 8 || isNaN(Number(dni))) {
            toast.error('El DNI ingresado no es válido (máximo 8 dígitos numéricos).');
            return;
        }

        if (pin.length < 4) {
            toast.error('El PIN debe tener al menos 4 dígitos.');
            return;
        }

        setIsLoading(true);
        const email = getSyntheticEmail(dni);
        const password = getSecurePassword(pin);

        try {
            if (isLogin) {
                // INICIAR SESIÓN
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    if (error.message.includes('Invalid login credentials')) {
                        toast.error('DNI o PIN incorrectos. Si no tienes cuenta, Regístrate.');
                    } else {
                        toast.error('Error al iniciar sesión: ' + error.message);
                    }
                    throw error;
                }

                toast.success('¡Sesión iniciada correctamente!');
                onLoginSuccess(data.session);

            } else {
                // REGISTRARSE
                if (!nombre) {
                    toast.error('Ingresa tu nombre para registrarte.');
                    setIsLoading(false);
                    return;
                }

                // Si no verificó el captcha
                if (!captchaVerified) {
                    toast.error('Por favor, resuelve el Captcha para verificar que eres humano.');
                    setIsLoading(false);
                    return;
                }

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            nombre: nombre
                        }
                    }
                });

                if (error) {
                    if (error.message.includes('already registered')) {
                        toast.error('Error: El DNI ya se encuentra registrado. Inicia sesión.');
                    } else if (error.message.includes('Password should be')) {
                        toast.error('Error en el PIN. Debe cumplir normas de seguridad.');
                    } else {
                        toast.error('Error al crear la cuenta: ' + error.message);
                    }
                    setCaptchaVerified(false);
                    throw error;
                }

                // Insertar el perfil público
                const { error: profileError } = await supabase
                    .from('perfiles')
                    .insert([
                        { id: data.user.id, dni: dni, nombre: nombre }
                    ]);

                if (profileError) {
                    console.error("Error creating profile:", profileError);
                }

                // Insertar fila inicial de progreso
                const { error: progressError } = await supabase
                    .from('progreso_plan')
                    .insert([
                        { user_id: data.user.id }
                    ]);

                if (progressError) {
                    console.error("Error creating initial progress:", progressError);
                }

                toast.success('¡Cuenta creada con éxito! Bienvenid@.');
                onLoginSuccess(data.session);
            }
        } catch (error) {
            console.error(error);
            // Captura genérica final
            if (!isLogin && !error.message) {
                toast.error('Fallo de conexión crítico. Revisa tu internet.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Manejador del Captcha Real
    const handleCaptchaChange = (value) => {
        if (value) {
            setCaptchaVerified(true);
        } else {
            setCaptchaVerified(false);
        }
    };

    // Al cambiar de tab, reiniciamos el estado
    const switchTab = (toLogin) => {
        setIsLogin(toLogin);
        setCaptchaVerified(false);
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
                <div className="auth-header">
                    <h3>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h3>
                    <button className="auth-close" onClick={onClose} disabled={isLoading}>&times;</button>
                </div>

                <div className="auth-body">
                    <div className="auth-tabs">
                        <button
                            type="button"
                            className={`auth-tab ${isLogin ? 'active' : ''}`}
                            onClick={() => switchTab(true)}
                        >
                            Ingresar
                        </button>
                        <button
                            type="button"
                            className={`auth-tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => switchTab(false)}
                        >
                            Registrarse
                        </button>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="input-group">
                                <label htmlFor="nombre">Nombre (o Apodo)</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej: Nacho"
                                    disabled={isLoading}
                                    maxLength={30}
                                />
                            </div>
                        )}

                        <div className="input-group">
                            <label htmlFor="dni">Tu DNI</label>
                            <input
                                type="number"
                                id="dni"
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                                placeholder="Sin puntos (ej: 40123456)"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="pin">Pin de seguridad</label>
                            <input
                                type="password"
                                id="pin"
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} // Solo números
                                placeholder="4 a 6 dígitos numéricos"
                                disabled={isLoading}
                                maxLength={6}
                                pattern="\d*"
                            />
                            {!isLogin && <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Este PIN será tu contraseña única y no podrá recuperarse, anótalo.</small>}
                        </div>

                        {!isLogin && (
                            <div className="recaptcha-wrapper" style={{ display: 'flex', justifyContent: 'center', margin: '0.75rem 0' }}>
                                <ReCAPTCHA
                                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                                    onChange={handleCaptchaChange}
                                    theme={document.body.classList.contains('dark-mode') ? 'dark' : 'light'}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`auth-submit ${captchaVerified && !isLogin ? 'success-pulse' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Cargando...' : (
                                isLogin ? 'Acceder al Plan' : (
                                    captchaVerified ? 'Finalizar Registro' : 'Crear Cuenta'
                                )
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;

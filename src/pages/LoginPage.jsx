import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import AppIcon from '../components/AppIcon';
import AuthHeader from '../components/AuthHeader';
import { supabase } from '../supabaseClient';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (error) throw error;

            console.log("Login successo:", data);

            // Recupera il profilo per mantenere la compatibilità con il resto dell'app
            if (data.user) {
                let { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                // SELF-HEALING: Se il profilo non esiste (trigger fallito?), crealo ora
                if (!profile) {
                    console.log("Profilo mancante, creazione fallback...");
                    const metadata = data.user.user_metadata || {};
                    const newProfile = {
                        id: data.user.id,
                        email: data.user.email,
                        name: metadata.name || 'Utente',
                        surname: metadata.surname || '',
                        role: metadata.role || 'caregiver',
                        photo_url: metadata.photo_url || null
                    };
                    
                    const { error: createError } = await supabase.from('profiles').insert([newProfile]);
                    if (!createError) profile = newProfile;
                }

                if (profile) {
                    localStorage.setItem('alzheimer_user', JSON.stringify({
                        id: profile.id,
                        name: profile.name,
                        surname: profile.surname,
                        photo: profile.photo_url,
                        role: profile.role,
                        email: profile.email ?? data.user?.email ?? null
                    }));
                }
            }
            
            // Reindirizza alla home
            navigate('/');
            // Forza ricaricamento eventi storage
            window.dispatchEvent(new Event('storage'));

        } catch (err) {
            console.error("Login fallito:", err);
            // Mostra messaggio errore più specifico
            let msg = "Email o password non validi."; // Default
            if (err.message.includes("Email not confirmed")) msg = "Controlla la tua email per confermare l'account.";
            if (err.message.includes("Invalid login credentials")) msg = "Email o password errati.";
            
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            backgroundColor: 'var(--color-bg-primary)',
            textAlign: 'center'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '40px 30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid var(--color-border)'
        },
        title: { fontSize: '26px', fontWeight: '800', marginBottom: '8px', color: 'var(--color-primary)' },
        subtitle: { fontSize: '15px', color: '#666', marginBottom: '32px' },
        form: { display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' },
        inputGroup: { marginBottom: '5px' },
        label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px', marginLeft: '4px' },
        inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
        icon: { position: 'absolute', left: '14px', color: '#999' },
        input: {
            width: '100%',
            padding: '14px 14px 14px 44px',
            borderRadius: '12px',
            border: '1px solid #ddd',
            fontSize: '16px',
            outline: 'none',
            backgroundColor: '#f9f9f9',
            transition: 'border-color 0.2s'
        },
        button: {
            padding: '16px',
            fontSize: '17px',
            fontWeight: 'bold',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'wait' : 'pointer',
            marginTop: '10px',
            transition: 'background-color 0.2s ease',
            width: '100%',
            opacity: loading ? 0.7 : 1
        },
        errorBox: {
            backgroundColor: '#FFF0F0', color: '#D32F2F', padding: '12px', borderRadius: '8px', 
            fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'
        }
    };

    return (
        <div className="auth-page" style={styles.container}>
            <div className="auth-card" style={styles.card}>
                <AuthHeader />
                <h1 style={styles.title}>Bentornat*</h1>
                <p style={styles.subtitle}>Inserisci le tue credenziali per accedere</p>

                {error && <div style={styles.errorBox}><AlertCircle size={18}/> {error}</div>}

                <form style={styles.form} onSubmit={handleLogin}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <div style={styles.inputWrapper}>
                            <AppIcon name="envelope" size={18} color="primary" style={styles.icon}/>
                            <input 
                                style={styles.input} 
                                type="email" 
                                placeholder="nome@email.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrapper}>
                            <AppIcon name="lock" size={18} color="primary" style={styles.icon}/>
                            <input 
                                style={styles.input} 
                                type="password" 
                                placeholder="La tua password sicura" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Acceso in corso...' : 'Accedi'}
                    </button>
                </form>

                <div style={{marginTop: '25px', fontSize:'14px', color:'#666', borderTop:'1px solid #eee', paddingTop:'20px'}}>
                    Non hai un account? <br/>
                    <Link to="/signup" style={{color:'var(--color-primary)', fontWeight:'bold', textDecoration:'none', display:'inline-block', marginTop:'5px'}}>
                        Crea un nuovo account
                    </Link>
                </div>
            </div>

            <div style={{ marginTop: '40px', fontSize: '11px', color: '#999', lineHeight: '1.4' }}>
                Creato da <strong>Daniele Spalletti</strong> e <strong>Michele Mosca</strong><br />
                di <a href="https://www.cosmonet.info" target="_blank" style={{color: '#999'}}>cosmonet.info</a>
            </div>
        </div>
    );
};

export default LoginPage;

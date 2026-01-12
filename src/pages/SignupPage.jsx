import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';

const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        role: 'caregiver' // Default
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Registrazione su Supabase Auth
            // Passiamo nome, cognome e ruolo nei "metadata" così il trigger SQL li salva nel profilo
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        surname: formData.surname,
                        role: formData.role
                    }
                }
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                alert("Registrazione completata! Ora puoi accedere.");
                navigate('/login');
            }

        } catch (err) {
            console.error("Errore registrazione:", err);
            setError(err.message || "Errore durante la registrazione.");
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
            padding: '30px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid var(--color-border)'
        },
        title: { fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' },
        subtitle: { fontSize: '14px', color: '#666', marginBottom: '24px' },
        inputGroup: { marginBottom: '16px', textAlign: 'left' },
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
            width: '100%',
            padding: '16px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'wait' : 'pointer',
            marginTop: '10px',
            opacity: loading ? 0.7 : 1
        },
        backLink: { marginTop: '20px', color: '#666', fontSize: '14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', textDecoration:'none' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <img src="/logo.png" alt="Logo" style={{width: 60, height: 60, borderRadius: 12, marginBottom: 15}}/>
                <h1 style={styles.title}>Crea Account</h1>
                <p style={styles.subtitle}>Unisciti alla nostra community</p>

                {error && (
                    <div style={{backgroundColor:'#FFF0F0', color:'#D32F2F', padding:'12px', borderRadius:'8px', fontSize:'13px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px'}}>
                        <AlertCircle size={16}/> {error === 'User already registered' ? 'Utente già registrato.' : error}
                    </div>
                )}

                <form onSubmit={handleSignup}>
                    <div style={{display:'flex', gap:'10px'}}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Nome</label>
                            <div style={styles.inputWrapper}>
                                <User size={18} style={styles.icon}/>
                                <input name="name" style={styles.input} placeholder="Mario" required onChange={handleChange} />
                            </div>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Cognome</label>
                            <div style={styles.inputWrapper}>
                                <User size={18} style={styles.icon}/>
                                <input name="surname" style={styles.input} placeholder="Rossi" required onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={18} style={styles.icon}/>
                            <input name="email" type="email" style={styles.input} placeholder="mario@email.com" required onChange={handleChange} />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={18} style={styles.icon}/>
                            <input name="password" type="password" style={styles.input} placeholder="••••••••" required minLength={6} onChange={handleChange} />
                        </div>
                    </div>

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Creazione in corso...' : 'Registrati'}
                    </button>
                </form>

                <div style={{marginTop: '20px', fontSize:'14px', color:'#666'}}>
                    Hai già un account? <Link to="/login" style={{color:'var(--color-primary)', fontWeight:'bold', textDecoration:'none'}}>Accedi</Link>
                </div>
            </div>

            <div style={{ marginTop: '20px', fontSize: '11px', color: '#999', lineHeight: '1.4' }}>
                Creato da <strong>Daniele Spalletti</strong> e <strong>Michele Mosca</strong><br />
                di <a href="https://www.cosmonet.info" target="_blank" style={{color: '#999'}}>cosmonet.info</a>
            </div>
        </div>
    );
};

export default SignupPage;

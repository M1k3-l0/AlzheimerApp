import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle2, Users, Stethoscope, ChevronRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';

const LoginPage = () => {
    const [step, setStep] = useState(1); // 1: Selezione Ruolo, 2: Inserimento Dati
    const [role, setRole] = useState(null); // 'patient', 'caregiver', 'healthcare'
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [photo, setPhoto] = useState(null);
    const navigate = useNavigate();

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
        setRole(null);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (name.trim() && surname.trim() && role) {
            const userData = {
                name: name.trim(),
                surname: surname.trim(),
                photo: photo,
                role: role
            };

            // Salva localmente
            localStorage.setItem('alzheimer_user', JSON.stringify(userData));

            // Salva su Supabase (Sincronizzazione Profili)
            try {
                const userId = name.trim() + surname.trim();
                await supabase.from('profiles').upsert([{ 
                    id: userId, 
                    name: name.trim(), 
                    surname: surname.trim(), 
                    photo_url: photo,
                    role: role,
                    last_online: new Date().toISOString()
                }]);
            } catch (err) {
                console.error("Errore sync profilo DB:", err);
            }

            navigate('/');
            window.location.reload();
        }
    };

    const getRoleLabel = (r) => {
        switch(r) {
            case 'patient': return 'Paziente';
            case 'caregiver': return 'Familiare / Caregiver';
            case 'healthcare': return 'Operatore Sanitario';
            default: return '';
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
        logoImage: {
            width: '100px', 
            height: '100px', 
            marginBottom: '16px', 
            borderRadius: '24px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        title: {
            fontSize: '28px',
            fontWeight: '800',
            marginBottom: '8px',
            color: 'var(--color-primary)'
        },
        subtitle: {
            fontSize: '16px',
            color: '#65676B',
            marginBottom: '32px',
            fontWeight: '500',
            maxWidth: '280px',
            lineHeight: '1.4'
        },
        // Role Selection Styles
        roleGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px',
            width: '100%',
            maxWidth: '320px'
        },
        roleCard: {
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            border: '2px solid transparent',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            textAlign: 'left'
        },
        roleIconBox: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-primary)'
        },
        roleText: {
            flex: 1
        },
        roleTitle: {
            fontSize: '17px',
            fontWeight: '700',
            color: '#050505',
            marginBottom: '4px'
        },
        roleDesc: {
            fontSize: '13px',
            color: '#65676B'
        },
        // Form Styles
        formContainer: {
            width: '100%',
            maxWidth: '300px',
            animation: 'fadeIn 0.3s ease'
        },
        backButton: {
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#65676B',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '15px',
            fontWeight: '600'
        },
        photoContainer: {
            marginBottom: '20px',
            position: 'relative',
            cursor: 'pointer',
            width: '120px',
            height: '120px',
            margin: '0 auto 24px auto'
        },
        photoPlaceholder: {
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: '#F0F2F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden'
        },
        photoImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        },
        addPhotoLabel: {
            position: 'absolute',
            bottom: '0',
            right: '0',
            backgroundColor: 'white',
            color: 'var(--color-primary)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            border: '2px solid var(--color-primary)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        hiddenInput: {
            display: 'none'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        },
        input: {
            padding: '16px',
            fontSize: '17px',
            borderRadius: '12px',
            border: '1px solid #ddd',
            textAlign: 'center',
            outline: 'none',
            width: '100%',
            backgroundColor: 'white'
        },
        button: {
            padding: '16px',
            fontSize: '17px',
            fontWeight: 'bold',
            backgroundColor: photo && name && surname ? 'var(--color-primary)' : '#E4E6EB',
            color: photo && name && surname ? 'white' : '#BCC0C4',
            border: 'none',
            borderRadius: '12px',
            cursor: photo && name && surname ? 'pointer' : 'not-allowed',
            marginTop: '10px',
            transition: 'background-color 0.2s ease',
            width: '100%'
        },
        selectedRoleBadge: {
            backgroundColor: 'rgba(156, 105, 167, 0.1)',
            color: 'var(--color-primary)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '16px',
            display: 'inline-block'
        }
    };

    return (
        <div style={styles.container}>
            {step === 2 && (
                <button style={styles.backButton} onClick={handleBack}>
                    <ArrowLeft size={20} /> Indietro
                </button>
            )}

            <img src="/logo.png" alt="Memora Logo" style={styles.logoImage} />
            
            <h1 style={styles.title}>
                {step === 1 ? 'Chi userà Memora?' : 'Benvenuto!'}
            </h1>
            
            <p style={styles.subtitle}>
                {step === 1 
                    ? 'Seleziona il tuo ruolo per personalizzare l\'esperienza' 
                    : 'Completa il tuo profilo per iniziare'
                }
            </p>

            {step === 1 ? (
                <div style={styles.roleGrid}>
                    <div 
                        style={styles.roleCard} 
                        onClick={() => handleRoleSelect('patient')}
                        onMouseEnter={(e) => e.currentTarget.style.border = '2px solid var(--color-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.border = '2px solid transparent'}
                    >
                        <div style={styles.roleIconBox}>
                            <UserCircle2 size={24} />
                        </div>
                        <div style={styles.roleText}>
                            <div style={styles.roleTitle}>Paziente</div>
                            <div style={styles.roleDesc}>Voglio usare l'app per me stesso</div>
                        </div>
                        <ChevronRight size={20} color="#ccc" />
                    </div>

                    <div 
                        style={styles.roleCard}
                        onClick={() => handleRoleSelect('caregiver')}
                        onMouseEnter={(e) => e.currentTarget.style.border = '2px solid var(--color-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.border = '2px solid transparent'}
                    >
                        <div style={styles.roleIconBox}>
                            <Users size={24} />
                        </div>
                        <div style={styles.roleText}>
                            <div style={styles.roleTitle}>Familiare / Caregiver</div>
                            <div style={styles.roleDesc}>Assisto un mio caro</div>
                        </div>
                        <ChevronRight size={20} color="#ccc" />
                    </div>

                    <div 
                        style={styles.roleCard}
                        onClick={() => handleRoleSelect('healthcare')}
                        onMouseEnter={(e) => e.currentTarget.style.border = '2px solid var(--color-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.border = '2px solid transparent'}
                    >
                        <div style={styles.roleIconBox}>
                            <Stethoscope size={24} />
                        </div>
                        <div style={styles.roleText}>
                            <div style={styles.roleTitle}>Operatore Sanitario</div>
                            <div style={styles.roleDesc}>Sono un medico o infermiere</div>
                        </div>
                        <ChevronRight size={20} color="#ccc" />
                    </div>
                </div>
            ) : (
                <div style={styles.formContainer}>
                    <div style={styles.selectedRoleBadge}>
                        {getRoleLabel(role)}
                    </div>

                    <label style={styles.photoContainer}>
                        <div style={styles.photoPlaceholder}>
                            {photo ? (
                                <img src={photo} alt="Profilo" style={styles.photoImage} />
                            ) : (
                                <UserCircle2 size={60} color="#ccc" />
                            )}
                        </div>
                        <div style={styles.addPhotoLabel}>+</div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            style={styles.hiddenInput}
                        />
                    </label>

                    <form style={styles.form} onSubmit={handleLogin}>
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Il tuo nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Il tuo cognome"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            style={styles.button}
                            disabled={!photo || !name || !surname}
                        >
                            Accedi a Memora
                        </button>
                    </form>
                </div>
            )}

            <div style={{ marginTop: '40px', fontSize: '11px', color: '#999', lineHeight: '1.4' }}>
                Creato da <strong>Daniele Spalletti</strong> e <strong>Michele Mosca</strong><br />
                di <a href="https://www.cosmonet.info" target="_blank" style={{color: '#999'}}>cosmonet.info</a>
            </div>
        </div>
    );
};

export default LoginPage;

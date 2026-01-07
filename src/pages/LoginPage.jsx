import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle2 } from 'lucide-react';

const LoginPage = () => {
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

    const handleLogin = (e) => {
        e.preventDefault();
        if (name.trim() && surname.trim()) {
            const userData = {
                name: name.trim(),
                surname: surname.trim(),
                photo: photo
            };
            localStorage.setItem('alzheimer_user', JSON.stringify(userData));
            navigate('/');
            window.location.reload();
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
            backgroundColor: 'var(--color-bg-primary)', // Lilla chiaro
            textAlign: 'center'
        },
        photoContainer: {
            marginBottom: '20px',
            position: 'relative',
            cursor: 'pointer'
        },
        photoPlaceholder: {
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: '#e1e1e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
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
            backgroundColor: '#fff', // Changed to white/transparent
            color: 'var(--color-primary)', // Use brand purple
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            border: '2px solid var(--color-primary)'
        },
        hiddenInput: {
            display: 'none'
        },
        title: {
            fontSize: '32px',
            fontWeight: '800',
            marginBottom: '8px',
            color: 'var(--color-primary)'
        },
        subtitle: {
            fontSize: '18px',
            color: 'var(--color-primary)',
            marginBottom: '40px',
            fontWeight: '600'
        },
        form: {
            width: '100%',
            maxWidth: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        },
        input: {
            padding: '16px',
            fontSize: '18px',
            borderRadius: '12px',
            border: '1px solid #ddd',
            textAlign: 'center'
        },
        button: {
            padding: '16px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: photo && name && surname ? 'var(--color-primary)' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: photo && name && surname ? 'pointer' : 'not-allowed',
            marginTop: '10px'
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Ciao!</h1>
            <p style={styles.subtitle}>Chi sei?</p>

            <label style={styles.photoContainer}>
                <div style={styles.photoPlaceholder}>
                    {photo ? (
                        <img src={photo} alt="Profilo" style={styles.photoImage} />
                    ) : (
                        <UserCircle2 size={60} color="#999" />
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
                    placeholder="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    style={styles.input}
                    type="text"
                    placeholder="Cognome"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    style={styles.button}
                    disabled={!photo || !name || !surname}
                >
                    Entra
                </button>
            </form>
        </div>
    );
};

export default LoginPage;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  ChevronLeft,
  Bell,
  Type,
  ShieldAlert,
  HelpCircle,
  Info,
  ChevronRight,
  Phone,
  X
} from "lucide-react";

const SettingsPage = () => {
  const navigate = useNavigate();

  // 1. Stato Utente
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("alzheimer_user");
    return saved ? JSON.parse(saved) : { name: "Utente", surname: "", photo: null };
  });

  // 2. Stati Preferenze
  const [notifications, setNotifications] = useState(() => localStorage.getItem("setting_notifications") === "true");
  const [largeText, setLargeText] = useState(() => localStorage.getItem("setting_largeText") === "true");
  const [sosNumber, setSosNumber] = useState(() => localStorage.getItem("setting_sosNumber") || "");
  const [isEditingSos, setIsEditingSos] = useState(false);
  const [tempSos, setTempSos] = useState(sosNumber);

  // 3. Salvataggio Automatico Preferenze
  useEffect(() => {
    localStorage.setItem("setting_notifications", notifications);
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("setting_largeText", largeText);
    if (largeText) {
      document.body.classList.add("large-text-mode");
    } else {
      document.body.classList.remove("large-text-mode");
    }
  }, [largeText]);

  const handleLogout = () => {
    if (window.confirm("Vuoi davvero uscire dall'account?")) {
      localStorage.removeItem("alzheimer_user");
      window.location.href = "/login";
    }
  };

  const saveSosNumber = () => {
    localStorage.setItem("setting_sosNumber", tempSos);
    setSosNumber(tempSos);
    setIsEditingSos(false);
  };

  const handleSosClick = () => {
    if (!sosNumber) {
        setIsEditingSos(true);
    } else {
        // Avvia chiamata
        window.location.href = `tel:${sosNumber}`;
    }
  };

  const handleSupportClick = () => {
    window.location.href = "tel:02809767";
  };

  const styles = {
    container: {
      backgroundColor: "var(--color-bg-primary)",
      minHeight: "100%",
      padding: "16px",
      paddingBottom: "120px",
    },
    header: {
      display: "flex",
      alignItems: "center",
      marginBottom: "24px",
      gap: "12px",
    },
    backBtn: {
      padding: "8px",
      background: "white",
      borderRadius: "50%",
      color: "var(--color-primary)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      cursor: "pointer",
    },
    pageTitle: {
      fontSize: "24px",
      fontWeight: "800",
      color: "var(--color-primary)",
      margin: 0,
    },
    profileSection: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      marginBottom: "24px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    avatar: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      backgroundColor: "#F0F0F0",
      backgroundImage: user.photo ? `url(${user.photo})` : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "2px solid white",
    },
    sectionLabel: {
      fontSize: "13px",
      fontWeight: "700",
      color: "#8E8E93",
      textTransform: "uppercase",
      margin: "0 0 8px 12px",
    },
    menuCard: {
      backgroundColor: "white",
      borderRadius: "12px",
      overflow: "hidden",
      marginBottom: "24px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    menuItem: {
      display: "flex",
      alignItems: "center",
      padding: "16px",
      borderBottom: "1px solid #F2F2F7",
      cursor: "pointer",
      justifyContent: "space-between",
      background: "none",
      width: "100%",
      textAlign: "left",
      border: "none",
    },
    iconWrapper: (color) => ({
      width: "32px",
      height: "32px",
      borderRadius: "8px",
      backgroundColor: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      marginRight: "12px",
    }),
    itemContent: {
      flex: 1,
    },
    itemLabel: {
      fontSize: "17px",
      fontWeight: "500",
      color: "var(--color-text-primary)",
      display: "block",
    },
    itemSubLabel: {
      fontSize: "13px",
      color: "#8E8E93",
    },
    switch: (isOn) => ({
      width: "51px",
      height: "31px",
      backgroundColor: isOn ? "#34C759" : "#E9E9EA",
      borderRadius: "16px",
      position: "relative",
      transition: "0.3s",
    }),
    knob: (isOn) => ({
      width: "27px",
      height: "27px",
      backgroundColor: "white",
      borderRadius: "50%",
      position: "absolute",
      top: "2px",
      left: isOn ? "22px" : "2px",
      transition: "0.3s",
      boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
    }),
    modalOverlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '24px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    },
    input: {
        width: '100%',
        padding: '16px',
        fontSize: '18px',
        borderRadius: '12px',
        border: '1px solid #ddd',
        marginTop: '16px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    primaryBtn: {
        width: '100%',
        padding: '16px',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        borderRadius: '12px',
        fontSize: '18px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={styles.pageTitle}>Impostazioni</h1>
      </div>

      {/* Profilo */}
      <div style={styles.profileSection}>
        <div style={styles.avatar}>
          {!user.photo && <User size={30} color="#CCC" />}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "18px", margin: 0, fontWeight: '700' }}>
            {user.name} {user.surname}
          </h2>
          <p style={{ color: "#8E8E93", margin: "2px 0 0 0", fontSize: "14px" }}>
            Caregiver Registrato
          </p>
        </div>
      </div>

      {/* Preferenze */}
      <h3 style={styles.sectionLabel}>Generali</h3>
      <div style={styles.menuCard}>
        <button style={styles.menuItem} onClick={() => setNotifications(!notifications)}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.iconWrapper("#007AFF")}>
              <Bell size={18} />
            </div>
            <div style={styles.itemContent}>
              <span style={styles.itemLabel}>Notifiche Medicine</span>
              <span style={styles.itemSubLabel}>Avvisi orari farmaci</span>
            </div>
          </div>
          <div style={styles.switch(notifications)}>
            <div style={styles.knob(notifications)}></div>
          </div>
        </button>

        <button style={{ ...styles.menuItem, borderBottom: "none" }} onClick={() => setLargeText(!largeText)}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.iconWrapper("#5856D6")}>
              <Type size={18} />
            </div>
            <div style={styles.itemContent}>
              <span style={styles.itemLabel}>Testo Grande</span>
            </div>
          </div>
          <div style={styles.switch(largeText)}>
            <div style={styles.knob(largeText)}></div>
          </div>
        </button>
      </div>

      {/* Sicurezza */}
      <h3 style={styles.sectionLabel}>Sicurezza</h3>
      <div style={styles.menuCard}>
        <button style={styles.menuItem} onClick={handleSosClick}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.iconWrapper("#FF9500")}>
              <ShieldAlert size={18} />
            </div>
            <div style={styles.itemContent}>
              <span style={styles.itemLabel}>Contatti SOS</span>
              <span style={styles.itemSubLabel}>
                {sosNumber ? `Chiama subito: ${sosNumber}` : "Configura numero emergenza"}
              </span>
            </div>
          </div>
          {sosNumber ? <Phone size={20} color="#34C759" /> : <ChevronRight size={20} color="#C7C7CC" />}
        </button>

        <button style={{ ...styles.menuItem, borderBottom: "none" }} onClick={handleSupportClick}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.iconWrapper("#34C759")}>
              <HelpCircle size={18} />
            </div>
            <div style={styles.itemContent}>
              <span style={styles.itemLabel}>Supporto Tecnico</span>
              <span style={styles.itemSubLabel}>Chiama Pronto Alzheimer</span>
            </div>
          </div>
          <Phone size={20} color="#34C759" />
        </button>
      </div>

      {/* Azioni Account */}
      <button 
        style={{ ...styles.menuCard, ...styles.menuItem, borderBottom: 'none', color: '#FF3B30', marginTop: '20px' }}
        onClick={handleLogout}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ ...styles.iconWrapper('#FF3B30'), backgroundColor: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30' }}>
                <LogOut size={18} />
            </div>
            <span style={{ fontSize: '17px', fontWeight: '600' }}>Esci dall'App</span>
        </div>
      </button>

      {/* Modal Edit SOS */}
      {isEditingSos && (
          <div style={styles.modalOverlay}>
              <div style={styles.modal}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>Imposta Contatto SOS</h3>
                      <button onClick={() => setIsEditingSos(false)} style={{ background: 'none', border: 'none' }}>
                          <X size={24} />
                      </button>
                  </div>
                  <p style={{ color: '#666', marginTop: '8px' }}>Inserisci il numero di telefono da chiamare in caso di emergenza.</p>
                  <input
                    style={styles.input}
                    type="tel"
                    placeholder="Esempio: 3331234567"
                    value={tempSos}
                    onChange={(e) => setTempSos(e.target.value)}
                  />
                  <button style={styles.primaryBtn} onClick={saveSosNumber}>
                      Salva Numero
                  </button>
              </div>
          </div>
      )}

      {/* Footer info */}
      <div style={{ textAlign: "center", marginTop: "40px", paddingBottom: '20px' }}>
        <p style={{ color: "#8E8E93", fontSize: "12px", margin: 0 }}>
            AlzheimerApp v1.1.0 (Database Attivo)
        </p>
        <p style={{ color: "#8E8E93", fontSize: "12px", marginTop: "4px" }}>
            Sviluppato con ❤️ per Airalzh
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;

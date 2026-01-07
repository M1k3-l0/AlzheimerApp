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

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("alzheimer_user");
    return saved ? JSON.parse(saved) : { name: "Utente", surname: "", photo: null };
  });

  const [notifications, setNotifications] = useState(() => localStorage.getItem("setting_notifications") === "true");
  const [largeText, setLargeText] = useState(() => localStorage.getItem("setting_largeText") === "true");
  const [sosNumber, setSosNumber] = useState(() => localStorage.getItem("setting_sosNumber") || "");
  const [isEditingSos, setIsEditingSos] = useState(false);
  const [tempSos, setTempSos] = useState(sosNumber);

  useEffect(() => {
    localStorage.setItem("setting_notifications", notifications);
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("setting_largeText", largeText);
    if (largeText) document.body.classList.add("large-text-mode");
    else document.body.classList.remove("large-text-mode");
  }, [largeText]);

  const handleLogout = () => {
    if (window.confirm("Disconnettere l'account?")) {
      localStorage.removeItem("alzheimer_user");
      window.location.href = "/login";
    }
  };

  const styles = {
    container: { backgroundColor: "var(--color-bg-primary)", minHeight: "100%", padding: "16px", paddingBottom: "120px" },
    header: { display: "flex", alignItems: "center", marginBottom: "24px", gap: "12px" },
    backBtn: { padding: "8px", background: "white", borderRadius: "50%", color: "var(--color-primary-dark)", border: "none" },
    pageTitle: { fontSize: "24px", fontWeight: "800", color: "var(--color-primary-dark)", margin: 0 },
    profileSection: { backgroundColor: "white", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", border: '1px solid var(--color-border)' },
    avatar: { width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" },
    sectionLabel: { fontSize: "13px", fontWeight: "700", color: "var(--color-primary-dark)", textTransform: "uppercase", margin: "0 0 8px 12px", opacity: 0.7 },
    menuCard: { backgroundColor: "white", borderRadius: "16px", overflow: "hidden", marginBottom: "24px", border: '1px solid var(--color-border)' },
    menuItem: { display: "flex", alignItems: "center", padding: "16px", borderBottom: "1px solid var(--color-bg-primary)", cursor: "pointer", justifyContent: "space-between", background: "none", width: "100%", textAlign: "left", border: "none" },
    iconWrapper: (color) => ({ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", marginRight: "12px" }),
    itemLabel: { fontSize: "17px", fontWeight: "600", color: "var(--color-text-primary)" },
    switch: (isOn) => ({ width: "51px", height: "31px", backgroundColor: isOn ? "--color-success" : "#E9E9EA", borderRadius: "16px", position: "relative" }), // Using color variables or defaults
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', borderRadius: '24px', padding: '24px', width: '90%', maxWidth: '400px' },
    primaryBtn: { width: '100%', padding: '16px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '14px', fontSize: '18px', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}><ChevronLeft size={24} /></button>
        <h1 style={styles.pageTitle}>Impostazioni</h1>
      </div>

      <div style={styles.profileSection}>
        <div style={styles.avatar}>{user.photo ? <img src={user.photo} style={{width:'100%', height:'100%', borderRadius:'50%'}}/> : <User size={30} />}</div>
        <div>
          <h2 style={{ fontSize: "18px", margin: 0, fontWeight: '700', color: 'var(--color-primary-dark)' }}>{user.name} {user.surname}</h2>
          <p style={{ color: "var(--color-primary)", margin: 0, fontSize: "14px", fontWeight: '500' }}>Account Caregiver</p>
        </div>
      </div>

      <h3 style={styles.sectionLabel}>Personalizzazione</h3>
      <div style={styles.menuCard}>
        <button style={styles.menuItem} onClick={() => setNotifications(!notifications)}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.iconWrapper("var(--color-primary)")}><Bell size={18} /></div>
            <div>
              <span style={styles.itemLabel}>Notifiche</span>
              <div style={{fontSize: '12px', color: '#888'}}>Avvisi e promemoria</div>
            </div>
          </div>
          <div style={{...styles.switch(notifications), backgroundColor: notifications ? 'var(--color-success)' : '#ddd'}}><div style={{width: 27, height: 27, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: notifications ? 22 : 2, transition: '0.3s'}}/></div>
        </button>

        <button style={{ ...styles.menuItem, borderBottom: "none" }} onClick={() => setLargeText(!largeText)}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.iconWrapper("var(--color-primary-dark)")}><Type size={18} /></div>
            <span style={styles.itemLabel}>Caratteri Grandi</span>
          </div>
          <div style={{...styles.switch(largeText), backgroundColor: largeText ? 'var(--color-success)' : '#ddd'}}><div style={{width: 27, height: 27, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: largeText ? 22 : 2, transition: '0.3s'}}/></div>
        </button>
      </div>

      <h3 style={styles.sectionLabel}>Sicurezza</h3>
      <div style={styles.menuCard}>
        <button style={styles.menuItem} onClick={() => { if(!sosNumber) setIsEditingSos(true); else window.location.href=`tel:${sosNumber}`; }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.iconWrapper("var(--color-accent)")}><ShieldAlert size={18} /></div>
            <div>
              <span style={styles.itemLabel}>Contatto SOS</span>
              <div style={{fontSize: '12px', color: '#888'}}>{sosNumber ? `Chiama: ${sosNumber}` : 'Non impostato'}</div>
            </div>
          </div>
          <ChevronRight size={20} color="#ccc" />
        </button>

        <button style={{ ...styles.menuItem, borderBottom: "none" }} onClick={() => window.location.href="tel:02809767"}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.iconWrapper("var(--color-success)")}><HelpCircle size={18} /></div>
            <span style={styles.itemLabel}>Pronto Alzheimer</span>
          </div>
          <Phone size={18} color="var(--color-success)" />
        </button>
      </div>

      {isEditingSos && (
          <div style={styles.modalOverlay}>
              <div style={styles.modal}>
                  <h3 style={{ color: 'var(--color-primary-dark)', marginBottom: '8px' }}>Imposta numero SOS</h3>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Il numero che potrai chiamare rapidamente in caso di bisogno.</p>
                  <input style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '18px', marginBottom: '20px' }} type="tel" value={tempSos} onChange={(e)=>setTempSos(e.target.value)} placeholder="Esempio: 333..." />
                  <button style={styles.primaryBtn} onClick={() => { localStorage.setItem("setting_sosNumber", tempSos); setSosNumber(tempSos); setIsEditingSos(false); }}>Salva Numero</button>
                  <button style={{ width: '100%', padding: '14px', background: 'none', color: '#888', marginTop: '8px' }} onClick={() => setIsEditingSos(false)}>Annulla</button>
              </div>
          </div>
      )}

      <button style={{ width: '100%', padding: '18px', background: 'white', color: 'var(--color-error)', borderRadius: '16px', fontWeight: 'bold', border: '1px solid var(--color-error)' }} onClick={handleLogout}>
        Esci dall'Account
      </button>

      <div style={{ textAlign: "center", marginTop: "40px", color: "#888", fontSize: "12px" }}>
        Memora x Airalzh &copy; 2026
      </div>
    </div>
  );
};

export default SettingsPage;

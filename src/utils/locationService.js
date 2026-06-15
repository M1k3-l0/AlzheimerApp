import { Geolocation } from '@capacitor/geolocation';

/**
 * Recupera la posizione attuale dell'utente.
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentPosition = async () => {
    // Se siamo su Web/PWA, usiamo direttamente l'API nativa del browser che è più affidabile per i popup
    if (!window.Capacitor || window.Capacitor.getPlatform() === 'web') {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalizzazione non supportata dal browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Errore Geolocation Web:', error);
                    let msg = 'Errore sconosciuto';
                    if (error.code === 1) msg = 'Permessi negati dal browser.';
                    else if (error.code === 2) msg = 'Posizione non disponibile.';
                    else if (error.code === 3) msg = 'Timeout richiesta.';
                    reject(new Error(msg));
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    }

    // Su Android/iOS nativo usiamo il plugin Capacitor
    try {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
            const request = await Geolocation.requestPermissions();
            if (request.location !== 'granted') throw new Error('Permessi negati');
        }
        const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
        return { latitude: coordinates.coords.latitude, longitude: coordinates.coords.longitude };
    } catch (error) {
        console.error('Errore Geolocation Nativa:', error);
        throw error;
    }
};

/**
 * Esegue il reverse geocoding di base via Nominatim (OpenStreetMap).
 * Nota: In produzione sarebbe meglio usare un servizio a pagamento come Google Maps o Mapbox.
 * @param {number} lat 
 * @param {number} lng 
 * @returns {Promise<string>}
 */
export const getAddressFromCoords = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'it-IT,it;q=0.9'
                }
            }
        );
        const data = await response.json();
        return data.display_name || 'Posizione ignota';
    } catch (error) {
        console.error('Errore durante il reverse geocoding:', error);
        return 'Indirizzo non disponibile';
    }
};

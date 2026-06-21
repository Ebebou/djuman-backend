/**
 * DJUMAN — Admin Dashboard Script
 * Gère : chargement waitlist, recherche, stats, export CSV, déconnexion
 */

// ============================================
// CONSTANTES & SÉLECTEURS
// ============================================
const TOKEN_KEY = 'djuman_admin_token'; // Clé unique cohérente avec auth.js
const API_BASE  = '/api';               // Relatif → fonctionne en local ET en prod

const tableBody        = document.getElementById('waitlistTableBody');
const statusContainer  = document.getElementById('statusContainer');
const searchInput      = document.getElementById('searchInput');
const exportBtn        = document.getElementById('exportCsvBtn');
const logoutBtn        = document.getElementById('logoutBtn');
const totalEl          = document.getElementById('totalInscriptions');
const todayEl          = document.getElementById('todayInscriptions');

// ============================================
// SÉCURITÉ : Vérification du token au chargement
// ============================================
const token = localStorage.getItem(TOKEN_KEY);
if (!token) {
    // Pas de token → on renvoie immédiatement à la page de login
    window.location.replace('admin-login.html');
}

// ============================================
// UTILITAIRE : Mise à jour de l'état visuel du tableau
// ============================================
function updateTableStatus(type) {
    // Supprime toutes les lignes sauf la ligne de statut
    tableBody.innerHTML = `<tr id="tableStatusRow">
        <td colspan="7" style="text-align:center; padding:48px; background:var(--white, #fff);">
            <div id="statusContainer" style="display:flex; flex-direction:column; align-items:center; gap:12px; justify-content:center;"></div>
        </td>
    </tr>`;

    const sc = document.getElementById('statusContainer');

    const states = {
        loading: `
            <i data-lucide="loader-2" class="spin-icon" style="width:24px;height:24px;color:#0E3A79;"></i>
            <span style="color:#595959;">Chargement des inscrits en cours...</span>`,

        empty: `
            <i data-lucide="folder-open" style="width:32px;height:32px;color:#BE710A;"></i>
            <span style="color:#595959;font-weight:500;">Aucun inscrit pour le moment.</span>`,

        error: `
            <i data-lucide="wifi-off" style="width:32px;height:32px;color:#DC2626;"></i>
            <span style="color:#DC2626;font-weight:600;">Problème de connexion ou serveur injoignable.</span>
            <button onclick="fetchWaitlistData()" style="margin-top:8px;background:#0E3A79;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">
                🔄 Réessayer
            </button>`
    };

    sc.innerHTML = states[type] || '';
    if (window.lucide) lucide.createIcons();
}

// ============================================
// UTILITAIRE : Formater une date en heure locale Abidjan
// ============================================
function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('fr-FR', {
        day:   '2-digit',
        month: '2-digit',
        year:  'numeric',
        timeZone: 'Africa/Abidjan'
    });
}

// ============================================
// UTILITAIRE : Sécuriser l'injection HTML (anti-XSS)
// ============================================
function escape(str) {
    if (!str) return '—';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ============================================
// RÉCUPÉRATION DES DONNÉES WAITLIST
// ============================================
async function fetchWaitlistData(search = '') {
    updateTableStatus('loading');

    try {
        const url = search
            ? `${API_BASE}/waitlist?search=${encodeURIComponent(search)}`
            : `${API_BASE}/waitlist`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                'Content-Type': 'application/json'
            }
        });

        // Token expiré ou invalide → logout automatique
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        if (!response.ok) throw new Error('Erreur serveur');

        const result = await response.json();
        const inscrits = result.data || [];

        // Mise à jour des métriques
        if (totalEl) totalEl.textContent = result.total ?? inscrits.length;
        if (todayEl) todayEl.textContent = countToday(inscrits);

        // Cas : liste vide
        if (inscrits.length === 0) {
            updateTableStatus('empty');
            return;
        }

        // Rendu du tableau
        tableBody.innerHTML = inscrits.map(lead => `
            <tr>
                <td>${escape(lead.last_name)} ${escape(lead.first_name)}</td>
                <td>${escape(lead.email)}</td>
                <td>${escape(lead.phone)}</td>
                <td>${escape(lead.company_name)}</td>
                <td>${escape(lead.business_type)}</td>
                <td>${formatDate(lead.created_at)}</td>
                <td><span class="badge-status">Validé</span></td>
            </tr>
        `).join('');

        if (window.lucide) lucide.createIcons();

    } catch (error) {
        console.error('Erreur fetchWaitlistData :', error);
        updateTableStatus('error');
    }
}

// ============================================
// COMPTE LES INSCRITS DU JOUR
// ============================================
function countToday(inscrits) {
    const today = new Date().toISOString().split('T')[0]; // "2026-06-18"
    return inscrits.filter(i => i.created_at && i.created_at.startsWith(today)).length;
}

// ============================================
// RECHERCHE AVEC DEBOUNCE (300ms)
// ============================================
let searchTimeout = null;

if (searchInput) {
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchWaitlistData(searchInput.value.trim());
        }, 300);
    });
}

// ============================================
// EXPORT CSV — Via l'API backend (propre & complet)
// ============================================
if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
        const originalHTML = exportBtn.innerHTML;
        exportBtn.disabled = true;
        exportBtn.innerHTML = `<span>Export en cours...</span>`;

        try {
            const response = await fetch(`${API_BASE}/waitlist/export`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
                }
            });

            if (!response.ok) throw new Error('Échec export');

            // Récupère le fichier binaire et déclenche le téléchargement
            const blob = await response.blob();
            const url  = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];

            link.href     = url;
            link.download = `djuman_waitlist_${date}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Erreur export CSV :', error);
            alert('Impossible de générer l\'export. Réessaye dans un instant.');
        } finally {
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalHTML;
        }
    });
}

// ============================================
// DÉCONNEXION
// ============================================
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.replace('admin-login.html');
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

// ============================================
// INITIALISATION AU CHARGEMENT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    fetchWaitlistData();
});

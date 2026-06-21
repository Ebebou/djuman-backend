/**
 * DJUMAN — Admin Login Script
 * Gère : authentification, stockage JWT, redirection
 */

document.addEventListener('DOMContentLoaded', () => {

    const TOKEN_KEY      = 'djuman_admin_token'; // ✅ Identique à admin.js
    const loginForm      = document.getElementById('adminLoginForm');
    const errorMessageDiv = document.getElementById('errorMessage');
    const errorTextSpan  = document.getElementById('errorText');

    // Masquer le bloc d'erreur par défaut
    if (errorMessageDiv) errorMessageDiv.style.display = 'none';

    // Si déjà connecté, rediriger directement vers le dashboard
    if (localStorage.getItem(TOKEN_KEY)) {
        window.location.replace('admin-dashboard.html');
        return;
    }

    // ============================================
    // SOUMISSION DU FORMULAIRE DE CONNEXION
    // ============================================
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();

            const email    = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('.btn-login');

            // Feedback visuel sur le bouton
            const originalHTML = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Connexion en cours...</span>`;

            try {
                const response = await fetch('/api/auth/login', { // ✅ URL relative
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Identifiants incorrects.');
                }

                // ✅ Stockage avec la clé unifiée
                localStorage.setItem(TOKEN_KEY, data.token);

                // Redirection vers le dashboard
                window.location.replace('admin-dashboard.html');

            } catch (error) {
                console.error('Erreur authentification :', error);
                showError(error.message || 'Une erreur réseau est survenue. Réessayez.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
            }
        });
    }

    // ============================================
    // UTILITAIRES AFFICHAGE ERREUR
    // ============================================
    function showError(message) {
        if (errorMessageDiv && errorTextSpan) {
            errorTextSpan.textContent = message;
            errorMessageDiv.style.display = 'flex';
        }
    }

    function hideError() {
        if (errorMessageDiv) {
            errorMessageDiv.style.display = 'none';
        }
    }
});

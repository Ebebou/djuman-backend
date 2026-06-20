const jwt = require('jsonwebtoken');
require('dotenv').config();

// ============================================
// MIDDLEWARE : VÉRIFICATION TOKEN JWT
// Protège toutes les routes admin sensibles
// ============================================
const authMiddleware = (req, res, next) => {
    // Récupère le header Authorization
    const authHeader = req.headers['authorization'];

    // Vérifie la présence et le format "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Accès refusé. Token manquant ou mal formaté.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Vérifie et décode le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Injecte les infos admin dans la requête pour les controllers suivants
        req.admin = decoded;
        next();

    } catch (error) {
        // Token expiré ou falsifié
        return res.status(403).json({
            success: false,
            message: 'Token invalide ou expiré. Veuillez vous reconnecter.'
        });
    }
};

module.exports = authMiddleware;

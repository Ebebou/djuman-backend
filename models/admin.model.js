const pool = require('../config/db');

const AdminModel = {

    // -----------------------------------------------
    // Recherche un admin par son email (pour le login)
    // -----------------------------------------------
    async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT id, email, password FROM admins WHERE email = ?',
            [email.trim().toLowerCase()]
        );
        return rows[0] || null;
    }
};

module.exports = AdminModel;

const pool = require('../config/db');

const WaitlistModel = {

    // -----------------------------------------------
    // Insère un nouvel inscrit dans la waitlist
    // -----------------------------------------------
    async create(data) {
        const sql = `
            INSERT INTO waitlist 
                (last_name, first_name, email, phone, company_name, business_type, sales_platform)
            VALUES 
                (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.nom,
            data.prenom,
            data.email,
            data.telephone,
            data.nom_entreprise || null, // Champ optionnel
            data.secteur_activite,
            data.canal_vente
        ];

        const [result] = await pool.execute(sql, values);
        return result;
    },

    // -----------------------------------------------
    // Vérifie si un email est déjà enregistré
    // -----------------------------------------------
    async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT id FROM waitlist WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    },

    // -----------------------------------------------
    // Récupère tous les inscrits (pour le dashboard admin)
    // Supporte une recherche optionnelle par mot-clé
    // -----------------------------------------------
    async findAll(search = '') {
        let sql = `
            SELECT 
                id,
                last_name,
                first_name,
                email,
                phone,
                company_name,
                business_type,
                sales_platform,
                created_at
            FROM waitlist
        `;
        const params = [];

        if (search && search.trim() !== '') {
            sql += `
                WHERE 
                    last_name   LIKE ? OR
                    first_name  LIKE ? OR
                    email       LIKE ? OR
                    company_name LIKE ? OR
                    business_type LIKE ?
            `;
            const keyword = `%${search.trim()}%`;
            params.push(keyword, keyword, keyword, keyword, keyword);
        }

        sql += ' ORDER BY created_at DESC';

        const [rows] = await pool.execute(sql, params);
        return rows;
    },

    // -----------------------------------------------
    // Compte total des inscrits (pour les stats du dashboard)
    // -----------------------------------------------
    async count() {
        const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM waitlist');
        return rows[0].total;
    }
};

module.exports = WaitlistModel;

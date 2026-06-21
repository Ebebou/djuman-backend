const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration du Pool de connexions MySQL avec le support des promesses
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    // 👇 AJOUTE CE BLOC ICI (Obligatoire pour Aiven en production)
    ssl: {
        rejectUnauthorized: false
    }
});

// Test de connexion au démarrage
pool.getConnection()
    .then(conn => {
        console.log('Base de données MySQL Djuman connectée avec succès.');
        conn.release();
    })
    .catch(err => {
        console.error('Erreur critique de connexion à MySQL :', err.message);
    });

module.exports = pool;
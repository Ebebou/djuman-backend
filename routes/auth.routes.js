const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth.controller');

// POST /api/auth/login — Connexion admin
router.post('/login', login);

module.exports = router;

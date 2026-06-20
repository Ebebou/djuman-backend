const express = require('express');
const router = express.Router();
const { register, getAll, exportCSV } = require('../controllers/waitlist.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// POST /api/waitlist/register — Inscription publique (pas de token requis)
router.post('/register', register);

// GET /api/waitlist — Liste complète des inscrits (Admin protégé par JWT)
router.get('/', authMiddleware, getAll);

// GET /api/waitlist/export — Export CSV (Admin protégé par JWT)
router.get('/export', authMiddleware, exportCSV);

module.exports = router;

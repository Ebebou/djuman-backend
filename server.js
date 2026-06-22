const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import des routes
const waitlistRoutes = require("./routes/waitlist.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARES GLOBAUX
// ============================================

// CORS : autorise les requêtes depuis le frontend public (à restreindre en prod)

const allowedOrigins = [
  "https://djuman.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origine non autorisée"));
    },
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse les corps de requêtes JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// FICHIERS STATIQUES : Administration privée
// ============================================
// Sert les pages admin (login + dashboard) depuis backend/public/
app.use(express.static(path.join(__dirname, "public")));

// ============================================
// ROUTES API
// ============================================
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/auth", authRoutes);

// Route de santé (health check)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Serveur Djuman opérationnel 🚀",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// GESTIONNAIRE D'ERREURS GLOBAL
// ============================================
app.use((err, req, res, next) => {
  console.error("Erreur serveur non gérée :", err.stack);
  res.status(500).json({
    success: false,
    message: "Une erreur interne est survenue.",
  });
});

// Route 404 pour toutes les autres requêtes API non trouvées

app.use("/api/*path", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint introuvable.",
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(` Serveur Djuman démarré sur le port ${PORT}`);
});




/*






const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import des routes
const waitlistRoutes = require("./routes/waitlist.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARES GLOBAUX
// ============================================

// CORS : autorise les requêtes depuis le frontend public (à restreindre en prod)

const allowedOrigins = [
  "https://djuman.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:5500"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origine non autorisée"));
      }
    },
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// Parse les corps de requêtes JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// FICHIERS STATIQUES : Administration privée
// ============================================
// Sert les pages admin (login + dashboard) depuis backend/public/
app.use(express.static(path.join(__dirname, "public")));

// ============================================
// ROUTES API
// ============================================
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/auth", authRoutes);

// Route de santé (health check)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Serveur Djuman opérationnel 🚀",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// GESTIONNAIRE D'ERREURS GLOBAL
// ============================================
app.use((err, req, res, next) => {
  console.error("Erreur serveur non gérée :", err.stack);
  res.status(500).json({
    success: false,
    message: "Une erreur interne est survenue.",
  });
});

// Route 404 pour toutes les autres requêtes API non trouvées

app.use("/api/*path", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint introuvable.",
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
app.listen(PORT,  "0.0.0.0", () => {
  console.log(`✅ Serveur Djuman démarré sur http://localhost:${PORT}`);
  console.log(`📊 Admin Dashboard : http://localhost:${PORT}/admin-login.html`);
});









*/


const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminModel = require("../models/admin.model");
require("dotenv").config();

// ============================================
// CONTRÔLEUR : CONNEXION ADMIN
// POST /api/auth/login
// ============================================
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validation basique
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email et mot de passe requis.",
    });
  }

  try {
    // Recherche de l'admin par email via le modèle
    const admin = await AdminModel.findByEmail(email);

    // Vérification : admin existe ?
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects.",
      });
    }

    // Vérification du mot de passe hashé bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects.",
      });
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET n'est pas défini.");
    }

    // Génération du token JWT (expire dans 8h)
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      success: true,
      message: "Connexion réussie.",
      token,
    });
  } catch (error) {
    console.error("Erreur login admin :", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la connexion.",
    });
  }
};

module.exports = { login };

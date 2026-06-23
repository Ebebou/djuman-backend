const WaitlistModel = require("../models/waitlist.model");
require("dotenv").config();

async function sendWelcomeEmail(prenom, email) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "Djuman", email: process.env.EMAIL_FROM },
      to: [{ email }],
      subject: `Bienvenue sur Djuman, ${prenom} ! 🚀`,
      htmlContent: buildWelcomeEmail(prenom),
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur API Brevo");
  }
}

function buildWelcomeEmail(prenom) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur Djuman</title>
    </head>
    <body style="margin:0; padding:0; background-color:#F6F4E6; font-family: 'Galano Grotesque', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F6F4E6; padding: 48px 16px;">
            <tr>
                <td align="center">
                    <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; background-color:#ffffff; border-radius:16px; border:1px solid #e8e6d9;">

                        <!-- LOGO -->
                        <tr>
                            <td style="padding: 40px 40px 32px; text-align:center;">
                                <img src="https://djuman.vercel.app/assets/image/logo-email.png" alt="Djuman" style="height:28px;">
                            </td>
                        </tr>

                        <!-- TITRE PRINCIPAL -->
                        <tr>
                            <td style="padding: 0 40px; text-align:center;">
                                <h1 style="color:#2B323E; font-size:22px; font-weight:500; margin:0 0 12px; letter-spacing:-0.01em;">
                                    Bienvenue, ${prenom}
                                </h1>
                                <p style="color:#5F5E5A; font-size:15px; line-height:1.6; margin:0;">
                                    Vous faites désormais partie des tout premiers membres de Djuman.
                                </p>
                            </td>
                        </tr>

                        <!-- BADGE STATUT -->
                        <tr>
                            <td style="padding: 28px 40px 0; text-align:center;">
                                <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                    <tr>
                                        <td style="background-color:#EAF3DE; border-radius:100px; padding: 8px 18px;">
                                            <span style="color:#27500A; font-size:13px; font-weight:500;">
                                                ● Place confirmée
                                            </span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- SEPARATEUR -->
                        <tr>
                            <td style="padding: 32px 40px 0;">
                                <hr style="border:none; border-top: 1px solid #e8e6d9; margin:0;">
                            </td>
                        </tr>

                        <!-- CORPS — TON CONFIANT ET PRIVILEGIE -->
                        <tr>
                            <td style="padding: 32px 40px 8px;">
                                <p style="color:#2B323E; font-size:15px; line-height:1.75; margin: 0 0 18px;">
                                    Votre inscription vous donne un accès prioritaire à Djuman dès son lancement, avant tout le monde.
                                </p>
                                <p style="color:#2B323E; font-size:15px; line-height:1.75; margin: 0 0 18px;">
                                    Nous tenons à vous tenir informé à chaque étape importante : avancement du développement, aperçus du design, et nouveautés à venir.
                                </p>
                                <p style="color:#2B323E; font-size:15px; line-height:1.75; margin: 0;">
                                    Vous n'avez rien à faire de plus — nous revenons vers vous prochainement.
                                </p>
                            </td>
                        </tr>

                        <!-- FOOTER -->
                        <tr>
                            <td style="padding: 40px 40px 32px; text-align:center;">
                                <hr style="border:none; border-top: 1px solid #e8e6d9; margin:0 0 24px;">
                                <p style="color:#888780; font-size:12px; line-height:1.6; margin:0;">
                                    Djuman · Abidjan, Côte d'Ivoire<br>
                                    Vous recevez cet email car vous êtes inscrit(e) sur djuman.com
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
}


const register = async (req, res) => {
  const { nom, prenom, email, telephone, nom_entreprise, secteur_activite, canal_vente } = req.body;

  if (!nom || !prenom || !email || !telephone || !secteur_activite || !canal_vente) {
    return res.status(400).json({ success: false, message: "Tous les champs obligatoires doivent être remplis." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Adresse email invalide." });
  }

  try {
    const existing = await WaitlistModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "Cette adresse e-mail est déjà enregistrée sur notre liste d'attente." });
    }

    await WaitlistModel.create(req.body);

    console.log(`📤 Tentative d'envoi d'email vers ${email}...`);
    try {
      await sendWelcomeEmail(prenom, email);
      console.log(`✅ Email envoyé à ${email}`);
    } catch (err) {
      console.error(`❌ ÉCHEC email :`, err.message);
    }

    return res.status(201).json({ success: true, message: "Inscription réussie. Un email de confirmation a été envoyé." });

  } catch (error) {
    console.error("Erreur inscription waitlist :", error.message);
    return res.status(500).json({ success: false, message: "Une erreur serveur est survenue. Réessaie dans un instant." });
  }
};

const getAll = async (req, res) => {
  try {
    const search = req.query.search || "";
    const inscrits = await WaitlistModel.findAll(search);
    const total = await WaitlistModel.count();
    return res.status(200).json({ success: true, total, data: inscrits });
  } catch (error) {
    console.error("Erreur récupération waitlist :", error.message);
    return res.status(500).json({ success: false, message: "Impossible de récupérer la liste." });
  }
};

const exportCSV = async (req, res) => {
  try {
    const inscrits = await WaitlistModel.findAll();
    const headers = ["ID", "Nom", "Prénom", "Email", "Téléphone", "Entreprise", "Secteur d'activité", "Canal de vente", "Date d'inscription"];
    const rows = inscrits.map((i) => [
      i.id, i.last_name, i.first_name, i.email, i.phone,
      i.company_name || "", i.business_type, i.sales_platform,
      new Date(i.created_at).toLocaleString("fr-FR", { timeZone: "Africa/Abidjan" }),
    ]);
    const escapeCSV = (val) => `"${String(val).replace(/"/g, '""')}"`;
    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");
    const filename = `djuman_waitlist_${new Date().toISOString().split("T")[0]}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send("\uFEFF" + csvContent);
  } catch (error) {
    console.error("Erreur export CSV :", error.message);
    return res.status(500).json({ success: false, message: "Impossible de générer l'export CSV." });
  }
};

module.exports = { register, getAll, exportCSV };

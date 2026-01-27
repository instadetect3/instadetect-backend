const express = require("express");
const cors = require("cors");
const { fetchProfile } = require("./instagramSession");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// 🚫 Desativar cache para evitar 304
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, status: "Backend online" });
});

// ✅ Perfil
app.get("/api/profile", async (req, res) => {
  try {
    const username = (req.query.username || "")
      .trim()
      .replace("@", "");

    if (!username) {
      return res.status(400).json({ error: "Usuário inválido" });
    }

    console.log("🔎 Buscando perfil:", username);

    const profile = await fetchProfile(username);

    if (!profile) {
      return res.status(404).json({
        error: "Instagram não respondeu ou perfil não existe",
      });
    }

    return res.json(profile);

  } catch (err) {
    console.error("❌ ERRO REAL:", err);

    return res.status(500).json({
      error: "Falha ao buscar perfil",
      details: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});

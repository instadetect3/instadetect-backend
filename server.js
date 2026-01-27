const express = require("express");
const cors = require("cors");
const { fetchProfile } = require("./instagramSession");

const app = express();

// ✅ Render usa porta dinâmica
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ Rota de teste (Render Health Check)
app.get("/health", (req, res) => {
  res.json({ ok: true, status: "Backend online" });
});

// ✅ Rota principal do perfil
app.get("/api/profile", async (req, res) => {
  const username = (req.query.username || "")
    .trim()
    .replace("@", "");

  if (!username) {
    return res.json({ error: "Usuário inválido" });
  }

  console.log("🔎 Buscando perfil:", username);

  try {
    const profile = await fetchProfile(username);

    if (!profile) {
      return res.json({ error: "Instagram não respondeu" });
    }

    return res.json(profile);

  } catch (err) {
    console.error("❌ Erro ao buscar perfil:", err.message);
    return res.json({
      error: "Erro interno no servidor",
      details: err.message,
    });
  }
});

// ✅ Iniciar servidor corretamente no Render
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});

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


// ✅ Feed Data (Stories + Posts simulados bonitos)
app.get("/api/feed-data", async (req, res) => {
  try {
    const username = (req.query.username || "")
      .trim()
      .replace("@", "");

    if (!username) {
      return res.status(400).json({ error: "Usuário inválido" });
    }

    console.log("📰 Gerando feed para:", username);

    // reutiliza o mesmo fetchProfile que já funciona
    const profile = await fetchProfile(username);

    if (!profile) {
      return res.status(404).json({
        error: "Perfil não encontrado",
      });
    }

    // ============================
    // STORIES (usando foto real do perfil)
    // ============================
    const stories = [];
    for (let i = 0; i < 12; i++) {
      stories.push({
        username: profile.username.slice(0, 3) + i + "*****",
        profile_pic_url: profile.photo,
      });
    }

    // ============================
    // POSTS (simulação premium)
    // ============================
    const posts = [];
    for (let i = 0; i < 5; i++) {
      posts.push({
        username: profile.username,
        profile_pic_url: profile.photo,
        image_url: profile.photo,
        caption: "Carregando publicações...",
        likes: Math.floor(Math.random() * 900 + 200),
      });
    }

    return res.json({
      username: profile.username,
      stories,
      posts,
    });

  } catch (err) {
    console.error("❌ Erro feed-data:", err);

    return res.status(500).json({
      error: "Falha ao gerar feed",
      details: err.message,
    });
  }
});

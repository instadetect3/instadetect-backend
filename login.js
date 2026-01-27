const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const SESSION_PATH = path.join(__dirname, "storage", "instagram.json");

  console.log("🚀 Abrindo navegador para login...");

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.instagram.com/", {
    waitUntil: "domcontentloaded"
  });

  console.log("🔐 Faça login manualmente agora.");
  console.log("✅ Quando estiver dentro do feed, aperte ENTER aqui no terminal.");

  // Espera você apertar ENTER
  await new Promise(resolve => process.stdin.once("data", resolve));

  // Salvar sessão
  await context.storageState({ path: SESSION_PATH });

  console.log("💾 Sessão salva em storage/instagram.json");
  console.log("✅ Agora pode fechar o navegador.");

  await browser.close();
})();

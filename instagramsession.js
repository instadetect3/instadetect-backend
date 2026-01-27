const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const STORAGE_DIR = path.join(__dirname, "storage");
const SESSION_PATH = path.join(STORAGE_DIR, "instagram.json");

let browser;
let context;

/* ===============================
   INICIAR NAVEGADOR UMA ÚNICA VEZ
   =============================== */
async function initBrowser() {
  if (browser && context) return;

  if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR);

  browser = await chromium.launch({
    headless: true
  });

  context = await browser.newContext({
    storageState: fs.existsSync(SESSION_PATH)
      ? SESSION_PATH
      : undefined
  });

  console.log("✅ Navegador iniciado em background");
}

/* ===============================
   BUSCAR PERFIL
   =============================== */
async function fetchProfile(username) {
  await initBrowser();

  const page = await context.newPage();

  try {
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "domcontentloaded"
    });

    await page.waitForTimeout(2000);

    const img = page.locator("header img").first();
    const buffer = await img.screenshot();

    const photo =
      "data:image/jpeg;base64," + buffer.toString("base64");

    const privateText = await page.locator("text=Esta conta é privada").count();

    let followers = "Oculto";
    let following = "Oculto";
    let isPrivate = false;

    if (privateText === 0) {
      followers = await page.locator("header ul li").nth(1).innerText();
      following = await page.locator("header ul li").nth(2).innerText();
    } else {
      isPrivate = true;
    }

    return {
      username,
      photo,
      followers,
      following,
      private: isPrivate
    };
  } catch (err) {
    return {
      error: "Erro ao carregar perfil",
      details: err.message
    };
  } finally {
    await page.close();
  }
}

module.exports = { fetchProfile };

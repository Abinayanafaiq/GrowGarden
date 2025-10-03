const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("✅ WhatsApp client is ready!");

  const channelId = "120363401997290171@newsletter"; // ID channel yang kamu dapat
  try {
    const message = "Halo, ini pesan otomatis ke channel 🚀";
    const sent = await client.sendMessage(channelId, message);
    console.log("Pesan terkirim:", sent.id.id);
  } catch (err) {
    console.error("❌ Gagal kirim pesan ke channel:", err);
  }
});

client.initialize();

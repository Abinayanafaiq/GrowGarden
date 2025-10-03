const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fetch = require("node-fetch");

const url = "https://gagapi.onrender.com/alldata";
const targetId = "120363401997290171@newsletter"; // ganti sesuai ID channel / grup / user

// Init WA client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp client is ready!");
  scheduleNextRun();
});

// Fungsi fetch & format data
async function fetchData() {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`Unexpected response ${res.statusText}`);
    const data = await res.json();

    let message = "📦 Update Data Grow a Garden:\n\n";

    if (data.gear) {
      message += "⚙️ Gear:\n";
      message +=
        data.gear.map((i) => `- ${i.name} (${i.quantity})`).join("\n") + "\n\n";
    }

    if (data.seeds) {
      message += "🌱 Seeds:\n";
      message +=
        data.seeds.map((i) => `- ${i.name} (${i.quantity})`).join("\n") +
        "\n\n";
    }

    if (data.eggs) {
      message += "🥚 Eggs:\n";
      message +=
        data.eggs.map((i) => `- ${i.name} (${i.quantity})`).join("\n") + "\n\n";
    }

    return message.trim();
  } catch (err) {
    console.error("Error fetching data:", err);
    return "❌ Error saat mengambil data dari API";
  }
}

// Kirim pesan & schedule berikutnya
async function sendMessageNow() {
  try {
    const msg = await fetchData();
    await client.sendMessage(targetId, msg);
    console.log("✅ Pesan terkirim:", new Date().toLocaleTimeString());
  } catch (err) {
    console.error("❌ Gagal kirim pesan:", err);
  }
  scheduleNextRun();
}

// Hitung delay sampai menit kelipatan 5 berikutnya
function scheduleNextRun() {
  const now = new Date();
  const minutes = now.getMinutes();
  const nextMinute = minutes + (5 - (minutes % 5)); // menit kelipatan 5 berikutnya

  const next = new Date(now);
  next.setMinutes(nextMinute);
  next.setSeconds(5); // delay 5 detik setelah menit kelipatan 5
  next.setMilliseconds(0);

  const delay = next - now;
  console.log(
    `⏳ Next run at: ${next.toLocaleTimeString()} (delay ${Math.round(
      delay / 1000
    )}s)`
  );

  setTimeout(sendMessageNow, delay);
}

client.initialize();

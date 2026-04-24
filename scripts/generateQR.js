const QRCode = require("qrcode");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  await QRCode.toFile("cropQR.png", contractAddress);

  console.log("✅ QR Code generated as cropQR.png");
}

main();
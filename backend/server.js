const express = require("express");
const { ethers } = require("ethers");
const QRCode = require("qrcode");
const cors = require("cors");

let users = [];

const app = express();

const cors = require("cors");

app.use(cors({
  origin: "https://crop-traceability-frontend.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// 🔥 IMPORTANT: handle preflight manually
app.options("*", cors());
app.use(express.json());

// 🔗 Blockchain connection
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

const privateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const wallet = new ethers.Wallet(privateKey, provider);

// ⚠️ MAKE SURE THIS IS LATEST DEPLOYED ADDRESS
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const abi = [
  "function addCrop(string,string,uint256,string,uint256)",
  "function getCrops() view returns (tuple(string,string,uint256,string,uint256,uint256)[])"
];

const contract = new ethers.Contract(contractAddress, abi, wallet);

// 🚀 ADD CROP
app.post("/addCrop", async (req, res) => {
  try {
    console.log("DATA RECEIVED:", req.body);
    const farmerName = req.body.farmer || "";
const cropName = req.body.crop || "";
const quantity = Number(req.body.quantity) || 0;
const location = req.body.location || "";
const price = Number(req.body.price) || 0;
console.log("FINAL VALUES:", farmerName, cropName, quantity, location, price);
    const tx = await contract.addCrop(
      farmerName,
      cropName,
      quantity,
      location,
      price
    );
    await tx.wait();

    // 🟢 SAFE ID GENERATION (NO getCrops dependency)
    const id = Date.now(); // unique ID

   const dataObj = {
  farmer: farmerName,
  crop: cropName,
  quantity,
  location,
  price
};
const base = "https://relapse-upstate-undermine.ngrok-free.dev";
const url = `${base}/frontend/view.html?farmer=${encodeURIComponent(farmerName)}&crop=${encodeURIComponent(cropName)}&quantity=${quantity}&location=${encodeURIComponent(location)}&price=${price}`;
    let qr;

try {
  qr = await QRCode.toDataURL(url);
} catch (err) {
  console.log("QR failed, using fallback");

  // fallback QR (simple image)
  qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
}

    res.json({
      message: "Crop added successfully",
      qr
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📊 MARKET PRICE
const MARKET_PRICE = {
  Rice: 50,
  Wheat: 40,
  Tomato: 30
};

// 📦 GET CROPS
app.get("/crops", async (req, res) => {
  try {
    const data = await contract.getCrops();

    const formatted = data.map(crop => {
      const farmerPrice = Number(crop[4]);
      const marketPrice = MARKET_PRICE[crop[1]] || 50;

      let diff = Math.abs(farmerPrice - marketPrice);
      let trustScore = "";

      if (diff < 10) trustScore = "⭐⭐⭐⭐⭐";
      else if (diff < 30) trustScore = "⭐⭐⭐⭐";
      else if (diff < 60) trustScore = "⭐⭐⭐";
      else trustScore = "⭐⭐";

      let verified = true;
      let warning = "";

      if (farmerPrice > marketPrice * 1.5) {
        verified = false;
        warning = "⚠ Price unusually high";
      }

      return {
        farmerName: crop[0],
        cropName: crop[1],
        quantity: Number(crop[2]),
        location: crop[3],
        price: farmerPrice,
        marketPrice,
        warning,
        verified,
        trustScore
      };
    });

    res.json(formatted);

  } catch (err) {
    console.error("GET CROPS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// 👤 SIGNUP
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  const userExists = users.find(u => u.username === username);

  if (userExists) {
    return res.json({ error: "User already exists" });
  }

  users.push({ username, password });

  res.json({ message: "Signup successful" });
});

// 🔐 LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.json({ error: "Invalid credentials" });
  }

  res.json({ message: "Login successful" });
});

// 🚀 START SERVER
app.listen(3000, "0.0.0.0", () => {
  console.log("🚀 Server running on http://0.0.0.0:3000");
});
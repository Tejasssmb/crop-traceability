const express = require("express");
const { ethers } = require("ethers");
const QRCode = require("qrcode");
const cors = require("cors");

const app = express();

// ✅ CORS (IMPORTANT)
app.use(cors());
app.use(express.json());

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

// ================= USERS =================
let users = [];

// ================= BLOCKCHAIN =================

// ⚠️ NOTE: This will NOT work on Render (localhost issue)
// but keeping your code as is
//const provider = new ethers.JsonRpcProvider("http://localhost:8545");

const privateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

//const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const abi = [
  "function addCrop(string,string,uint256,string,uint256)",
  "function getCrops() view returns (tuple(string,string,uint256,string,uint256,uint256)[])"
];

//const contract = new ethers.Contract(contractAddress, abi, wallet);

// ================= ADD CROP =================

let crops = [];

app.post("/addCrop", async (req, res) => {
  try {
    const farmerName = req.body.farmer || "";
    const cropName = req.body.crop || "";
    const quantity = Number(req.body.quantity) || 0;
    const location = req.body.location || "";
    const price = Number(req.body.price) || 0;

    const newCrop = {
      farmerName,
      cropName,
      quantity,
      location,
      price,
      marketPrice: 50,
      verified: true,
      trustScore: "⭐⭐⭐⭐"
    };

    crops.push(newCrop);

    const url = `https://crop-traceability-frontend.netlify.app/view.html?farmer=${encodeURIComponent(farmerName)}&crop=${encodeURIComponent(cropName)}&quantity=${quantity}&location=${encodeURIComponent(location)}&price=${price}`;

    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;

    res.json({
      message: "Crop added successfully",
      qr
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// ================= MARKET =================

const MARKET_PRICE = {
  Rice: 50,
  Wheat: 40,
  Tomato: 30
};

// ================= GET CROPS =================
app.get("/crops", (req, res) => {
  res.json(crops);
});
// ================= AUTH =================

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  const userExists = users.find(u => u.username === username);

  if (userExists) {
    return res.json({ error: "User already exists" });
  }

  users.push({ username, password });

  res.json({ message: "Signup successful" });
});

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

// ================= SERVER =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
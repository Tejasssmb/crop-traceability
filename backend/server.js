const express = require("express");
const QRCode = require("qrcode");
const cors = require("cors");

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

// ================= USERS =================
let users = [];

// ================= CROPS (NO BLOCKCHAIN) =================
let crops = [];

// ================= ADD CROP =================
app.post("/addCrop", async(req, res) => {
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

    // ✅ QR URL (your deployed frontend)
    const url = `https://crop-traceability.netlify.app/view.html?farmer=${encodeURIComponent(farmerName)}&crop=${encodeURIComponent(cropName)}&quantity=${quantity}&location=${encodeURIComponent(location)}&price=${price}`;
   const qr = await QRCode.toDataURL(url);

    res.json({
      message: "Crop added successfully",
      qr
    });

  } catch (err) {
    console.error("ADD CROP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= GET CROPS =================
app.get("/crops", (req, res) => {
  res.json(crops); // always returns array ✅
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
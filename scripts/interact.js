async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const Crop = await ethers.getContractFactory("CropTraceability");
  const crop = await Crop.attach(contractAddress);

  // Add crop data
  const tx = await crop.addCrop(
    "Ramesh",
    "Rice",
    500,
    "Karnataka"
  );

  await tx.wait();

  console.log("✅ Crop data added to blockchain");

  // Fetch data
  const crops = await crop.getCrops();
  console.log("📦 Stored Crops:", crops);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
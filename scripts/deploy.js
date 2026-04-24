async function main() {
  const Crop = await ethers.getContractFactory("CropTraceability");
  const crop = await Crop.deploy();

  await crop.waitForDeployment();

  console.log("Contract deployed to:", crop.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
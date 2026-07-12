// backend/contracts/scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const TouristPoints = await hre.ethers.getContractFactory("TouristPoints");
  const contract = await TouristPoints.deploy();
  await contract.waitForDeployment();
  console.log("TouristPoints deployed to:", await contract.getAddress());
}
main().catch(console.error);
// backend/src/services/contract.js
const { ethers } = require('ethers');
const contractABI = require('../../contracts/artifacts/contracts/TouristPoints.sol/TouristPoints.json').abi;

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const OPERATOR_PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL; // e.g. https://rpc-amoy.polygon.technology

const provider = new ethers.JsonRpcProvider(RPC_URL);
const operatorWallet = new ethers.Wallet(OPERATOR_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, operatorWallet);

async function mintPoints(toAddress, amount) {
  const tx = await contract.mint(toAddress, ethers.parseUnits(amount.toString(), 18));
  const receipt = await tx.wait();
  return receipt.hash;
}

async function burnPoints(fromAddress, amount) {
  const tx = await contract.burnFrom(fromAddress, ethers.parseUnits(amount.toString(), 18));
  const receipt = await tx.wait();
  return receipt.hash;
}

async function getBalance(address) {
  const balance = await contract.balanceOf(address);
  return Number(ethers.formatUnits(balance, 18));
}

module.exports = { mintPoints, burnPoints, getBalance };
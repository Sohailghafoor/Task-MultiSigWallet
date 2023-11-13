// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const MultiSigWallet = await hre.ethers.getContractFactory("MultiSigWallet");
  const walletAddresses = ["0xbC5844Bc9bC4c48D84De951Ce05Ce2c7b5590171", "0x63c24f35db3f2d7D2Ecb49626d02de2bbA093780"];

  const mutlisigwallets = await MultiSigWallet.deploy(walletAddresses, 2);

  await mutlisigwallets.deployed();

  console.log("MultiSigWallet deployed to:", mutlisigwallets.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
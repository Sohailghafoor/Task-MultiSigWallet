require("@nomicfoundation/hardhat-toolbox");
require('solidity-coverage');
require('hardhat-contract-sizer');
// require("@nomiclabs/hardhat-etherscan");
// require("@nomiclabs/hardhat-ethers");
require('dotenv').config();
const ETHER_SCAN = process.env.ETHER_SCAN
const INFURA_API_KEY = process.env.INFURA_API_KEY
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
	version : "0.8.19",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
},
networks: {
  sepolia: {
    url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    accounts: [`0x${SEPOLIA_PRIVATE_KEY}`]
    // timeout: 1000
  },
},
etherscan: {
  // ehterscan API key, obtain from etherscan.io. allow us to connect with our ether scan account.
  apiKey: ETHER_SCAN,
},
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  }
};


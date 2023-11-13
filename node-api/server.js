const express = require('express');
const  ethers  = require('ethers');
const bodyParser = require('body-parser');
const { successResponse, errorResponse } = require('./helpers/helper');
require('dotenv').config();
 //for testnet
const MultiVault = require('./abi/testnet');


const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
const provider = new ethers.providers.JsonRpcProvider(process.env.TENDERLY_URL);
const MultiVault_Contract = "0x535da5239141232e8d7c254747025e238c72e718";


app.post('/MultiVoult/proposeTransaction', async (req, res) => {
  try {
      const {_privateKey, _to, _data, _value } = req.body; 
      const wallet = new ethers.Wallet(_privateKey, provider);
      const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, wallet);
      console.log("Contract data Data" , Contract)

       const value = ethers.utils.parseUnits(_value.toString(), 'ether');

      const gasLimit = await Contract.estimateGas.proposeTransaction(_to, _data, value);

      // Transfer tokens to the specified address
      const transaction = await Contract.proposeTransaction(_to, _data, value , {
    gasLimit: gasLimit})

      const data = {
          transactionHash: transaction.hash
      };
      return res.status(200).json(successResponse('transaction details', data, 200));
  } catch (error) {
      return res.status(400).json(errorResponse('Something went wrong, Please try again later!', 400));
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});
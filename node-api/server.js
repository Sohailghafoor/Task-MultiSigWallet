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

// first main function user can call
app.post('/MultiVoult/proposeTransaction', async (req, res) => {
  try {
      const {_privateKey, _to, _data, _value } = req.body; 
      const wallet = new ethers.Wallet(_privateKey, provider);
      const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, wallet);

       const value = ethers.utils.parseEther(_value);

      const gasLimit = await Contract.estimateGas.proposeTransaction(_to, _data, value);
      const transaction = await Contract.proposeTransaction(_to, _data, value , {
    gasLimit: gasLimit,
    value: value
  })
	  await transaction.wait();

 
      const receipt = await provider.getTransactionReceipt(transaction.hash);
const events = Contract.interface.parseLog(receipt.logs[0]);
const data = {
  transactionHash: transaction.hash,
      txId: events.args[0].toString(), // assuming txId is the first argument in your event
      proposer: events.args[1], // assuming proposer is the second argument in your event
      to: events.args[2],
      value: ethers.utils.formatEther(events.args[3]), 
        };
      if (receipt) {
        if (receipt.status == 1) {
            return res.status(200).json(successResponse('Transaction successful', data, 200));
        } else {
            return res.status(400).json(errorResponse('Transaction failed by status', 400));
        }
    } else {
        return res.status(400).json(errorResponse('Transaction failed by receipt', 400));
    }
  } catch (error) {
      return res.status(400).json(errorResponse('Something went wrong, Please try again later!', 400));
  }
});


// secound mainfunction authurizedSigner approve transcation
app.post('/MultiVoult/approveTransaction', async (req, res) => {
  try {
      const {_privateKey, _txId } = req.body; 
      const wallet = new ethers.Wallet(_privateKey, provider);
      const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, wallet);


      const gasLimit = await Contract.estimateGas.approveTransaction();
      const transaction = await Contract.proposeTransaction(_txId, {
    gasLimit: gasLimit
    })
	  await transaction.wait();

 
      const receipt = await provider.getTransactionReceipt(transaction.hash);
const events = Contract.interface.parseLog(receipt.logs[0]);
const data = {
  transactionHash: transaction.hash,
      txId: events.args[0].toString(), // assuming txId is the first argument in your event
      proposer: events.args[1], // assuming proposer is the second argument in your event
      to: events.args[2],
      value: ethers.utils.formatEther(events.args[3]), 
        };
      if (receipt) {
        if (receipt.status == 1) {
            return res.status(200).json(successResponse('Transaction successful', data, 200));
        } else {
            return res.status(400).json(errorResponse('Transaction failed by status', 400));
        }
    } else {
        return res.status(400).json(errorResponse('Transaction failed by receipt', 400));
    }
  } catch (error) {
      return res.status(400).json(errorResponse('Something went wrong, Please try again later!', 400));
  }
});
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});
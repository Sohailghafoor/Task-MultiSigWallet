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
            return res.status(200).json(successResponse('Transaction successful propose', data, 200));
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


// secound mainfunction authurizedSigner approve transcation & and after final approval of authrozier, excutation function
app.post('/MultiVoult/approveTransaction', async (req, res) => {
  try {
      const {_privateKey, _txId } = req.body; 
      const wallet = new ethers.Wallet(_privateKey, provider);
      const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, wallet);


      const gasLimit = await Contract.estimateGas.approveTransaction(_txId);
      const transaction = await Contract.approveTransaction(_txId, {
    gasLimit: gasLimit
    })
	  await transaction.wait();

 
      const receipt = await provider.getTransactionReceipt(transaction.hash);
// const events = Contract.interface.parseLog(receipt.logs[0]);

 // Retrieve logs to get emitted events
 const logs = receipt.logs.map(log => Contract.interface.parseLog(log));

 // Assuming you have an event named 'TransactionProposed' in your contract
 const transactionApprovedEvent = logs.find(log => log.name === 'TransactionApproved');
 const transactionExecutedEvent = logs.find(log => log.name === 'TransactionExecuted');
const data = {
  transactionHash: transaction.hash,
  approver: transactionApprovedEvent.args[0], // assuming approver is the first argument in your event
  txId: transactionApprovedEvent.args[1].toString(), // assuming proposer is the second argument in your event
  executor: transactionExecutedEvent ? transactionExecutedEvent.args[0] : null,
  txId_Excute: transactionExecutedEvent ? transactionExecutedEvent.args[1].toString() : null,
  to: transactionExecutedEvent ? transactionExecutedEvent.args[2] : null,
       
};
      if (receipt) {
        if (receipt.status == 1) {
            return res.status(200).json(successResponse('Transaction successful Approved', data, 200));
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

// third revokeApproval to cancel approved 

app.post('/MultiVoult/revokeApproval', async (req, res) => {
  try {
      const {_privateKey, _txId } = req.body; 
      const wallet = new ethers.Wallet(_privateKey, provider);
      const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, wallet);


      const gasLimit = await Contract.estimateGas.revokeApproval(_txId);
      const transaction = await Contract.revokeApproval(_txId, {
    gasLimit: gasLimit
    })
	  await transaction.wait();

 
      const receipt = await provider.getTransactionReceipt(transaction.hash);
// const events = Contract.interface.parseLog(receipt.logs[0]);

 // Retrieve logs to get emitted events
 const logs = receipt.logs.map(log => Contract.interface.parseLog(log));

 // Assuming you have an event named 'TransactionProposed' in your contract
 const transactionRevokeEvent = logs.find(log => log.name === 'TransactionRevoke');
const data = {
  transactionHash: transaction.hash,
  owner: transactionRevokeEvent.args[0], // assuming approver is the first argument in your event
  txId: transactionRevokeEvent.args[1].toString(), // assuming proposer is the second argument in your event   
};
      if (receipt) {
        if (receipt.status == 1) {
            return res.status(200).json(successResponse('Transaction successful Revoked', data, 200));
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
// read functions
// check approvals of proposed
app.get('/MultiVoult/approvals', async (req, res) => {
  try {
    const { _txId, _address } = req.body;
    const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, provider);

    // Call the read function (no gas needed)
    const result = await Contract.approvals(_txId, _address);

    // Process the result as needed
    const data = {
      result: result, // assuming the result is a boolean, adjust as needed
    };

    return res.status(200).json(successResponse('Read function called successfully', data, 200));
  } catch (error) {
    return res.status(400).json(errorResponse('Something went wrong, Please try again later!', 400));
  }
});
app.get('/MultiVoult/authorizedSigners', async (req, res) => {
  try {
    const { _index } = req.body;
    const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, provider);

    // Call the read function (no gas needed)
    const result = await Contract.authorizedSigners(_index);

    // Process the result as needed
    const data = {
      address: result, // assuming the result is a boolean, adjust as needed
    };

    return res.status(200).json(successResponse('Read function called successfully', data, 200));
  } catch (error) {
    return res.status(400).json(errorResponse('Something went wrong, Please try again later!', 400));
  }
});
app.get('/MultiVoult/getAuthorizedSigners', async (req, res) => {
  try {
    const {  } = req.body;
    const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, provider);

    // Call the read function (no gas needed)
    const result = await Contract.getAuthorizedSigners();

    // Process the result as needed
    const data = {
      AuthorizedSignersAddress1: result[0], 
      AuthorizedSignersAddress2: result[1], 

    };

    return res.status(200).json(successResponse('Read function called successfully', data, 200));
  } catch (error) {
    return res.status(400).json(errorResponse('Something went wrong, Please try again later!', 400));
  }
});
app.get('/MultiVoult/getBalance', async (req, res) => {
  try {
    const {  } = req.body;
    const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, provider);

    // Call the read function (no gas needed)
    const result = await Contract.getBalance();

    // Process the result as needed
    const data = {
      ContractBalance:  ethers.utils.formatEther(result)

    };

    return res.status(200).json(successResponse('Read function called successfully', data, 200));
  } catch (error) {
    return res.status(400).json(errorResponse('Something went wrong, Please try again later!', 400));
  }
});
app.get('/MultiVoult/getTransactionCount', async (req, res) => {
  try {
    const {  } = req.body;
    const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, provider);

    // Call the read function (no gas needed)
    const result = await Contract.getTransactionCount();

    // Process the result as needed
    const data = {
      TransactionCount: result.toString()

    };

    return res.status(200).json(successResponse('Read function called successfully', data, 200));
  } catch (error) {
    return res.status(400).json(errorResponse('Something went wrong, Please try again later!', 400));
  }
}); 

app.get('/MultiVoult/isAuthorizedSigner', async (req, res) => {
  try {
    const { _address } = req.body;
    const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, provider);

    // Call the read function (no gas needed)
    const result = await Contract.isAuthorizedSigner(_address);

    // Process the result as needed
    const data = {
      AuthorizedSigner: result

    };

    return res.status(200).json(successResponse('Read function called successfully', data, 200));
  } catch (error) {
    return res.status(400).json(errorResponse('Something went wrong, Please try again later!', 400));
  }
});
app.get('/MultiVoult/owner', async (req, res) => {
  try {
    const {  } = req.body;
    const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, provider);

    // Call the read function (no gas needed)
    const result = await Contract.owner();

    // Process the result as needed
    const data = {
      ContractOwner: result

    };

    return res.status(200).json(successResponse('Read function called successfully', data, 200));
  } catch (error) {
    return res.status(400).json(errorResponse('Something went wrong, Please try again later!', 400));
  }
});
app.get('/MultiVoult/quorum', async (req, res) => {
  try {
    const {  } = req.body;
    const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, provider);

    // Call the read function (no gas needed)
    const result = await Contract.quorum();

    // Process the result as needed
    const data = {
      NoOfSingerForApproval: result.toString()

    };

    return res.status(200).json(successResponse('Read function called successfully', data, 200));
  } catch (error) {
    return res.status(400).json(errorResponse('Something went wrong, Please try again later!', 400));
  }
});

app.get('/MultiVoult/transactions', async (req, res) => {
  try {
    const { _index } = req.body;
    const Contract = new ethers.Contract(MultiVault_Contract, MultiVault, provider);

    // Call the read function (no gas needed)
    const result = await Contract.transactions(_index);

    // Process the result as needed
    const data = {
      toAdress: result[0],
      data: result[1].toString,
      etherValue: ethers.utils.formatEther(result[2]),
      executed: result[3],
      numberOfApprovals: result[4].toString()

    };

    return res.status(200).json(successResponse('Read function called successfully', data, 200));
  } catch (error) {
    return res.status(400).json(errorResponse('Something went wrong, Please try again later!', 400));
  }
});
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});
# Task-MultiSigWallet
```shell

These are two folder one is Solidity Smart Contract for MultiVault, i shared just for code review and for deployement envirment.

Secound folder is for node api, inside the folder you can run and excute the functions of smart contract with node api call.

```

# Clone the Repo
```shell
first command
 npm i 
```
```shell
for smart contract open Muli-signature-wallet folder to see the all functionality and deployment of smart contract 
```
# For Running API on local Open Folder Node-API

```shell
In Node-API Folder
run
node server.js

```
# Now you can Call api from postmen 
```shell
I will also share the Postmen Collection for testing of these API, just download that postmen collection and import into post men and then call one by one by passing right parameter
- proposeTransaction
- approveTransaction  
- revoke pending transactions 
- executeTransaction this function is auto call on secound approval of transction from singer 
- approvals
- getbalance
- authorizedSigners
- getAuthorizedSigners
- getTransactionCount
- isAuthorizedSigner
- owner (contract owner )
- quorum (number of approval for transaction needed)
- transactions (transaction id details)
```

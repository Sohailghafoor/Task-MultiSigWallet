// SPDX-License-Identifier: MIT
pragma solidity >=0.4.23 <= 0.8.19;

/**
 * @title MultiSigWallet
 * @author Sohail Ghafoor
 * @notice A simple multi-signature wallet with the specified features.
 */
contract MultiSigWallet {

    struct Transaction {
        address to;
        bytes data;
        uint amount;
        bool executed;
        uint numOfApprovals;
    }

    event TransactionProposed(uint indexed txId, address indexed proposer, address indexed to, uint value, bytes data);
    event TransactionApproved(address indexed approver, uint indexed txId);
    event TransactionExecuted(address indexed executor, uint indexed txId, address indexed to, uint value, bytes data);
    event TransactionRevoke(address indexed owner, uint indexed txId);

    address public owner;
    address[] public authorizedSigners;
    uint public quorum;
    Transaction[] public transactions;
    mapping(address => bool) public isAuthorizedSigner;
    mapping(uint => mapping(address => bool)) public approvals;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyAuthorizedSigner() {
        require(isAuthorizedSigner[msg.sender], "Not an authorized signer");
        _;
    }

    modifier notExecuted(uint _txId) {
        require(!transactions[_txId].executed, "Already executed");
        _;
    }

    modifier transactionExists(uint _txId) {
        require(_txId < transactions.length, "Transaction does not exist");
        _;
    }

    constructor(address[] memory _authorizedSigners, uint _quorum) payable {
        require(_authorizedSigners.length > 0, "Must have at least 1 authorized signer");
        require(_quorum <= _authorizedSigners.length, "Quorum must be less or equal to the number of authorized signers");

        owner = msg.sender;
        authorizedSigners = _authorizedSigners;
        quorum = _quorum;

        for (uint i; i < _authorizedSigners.length; i++) {
            require(_authorizedSigners[i] != address(0), "Authorized signer cannot be address(0)");
            require(!isAuthorizedSigner[_authorizedSigners[i]], "Duplicated authorized signer");

            isAuthorizedSigner[_authorizedSigners[i]] = true;
        }
    }

    function proposeTransaction(
        address _to,
        bytes calldata _data,
        uint _amount
    ) public onlyAuthorizedSigner returns (uint txId) {
        txId = transactions.length;
        Transaction memory transaction = Transaction({to: _to, data: _data, amount: _amount, executed: false, numOfApprovals: 0});
        transactions.push(transaction);

        emit TransactionProposed(txId, msg.sender, _to, _amount, _data);
    }

    function approveTransaction(uint _txId) public onlyAuthorizedSigner transactionExists(_txId) notExecuted(_txId) {
        require(!approvals[_txId][msg.sender], "Already approved");

        approvals[_txId][msg.sender] = true;
        Transaction storage txn = transactions[_txId];
        txn.numOfApprovals += 1;

        emit TransactionApproved(msg.sender, _txId);

        if (txn.numOfApprovals >= quorum) {
            executeTransaction(_txId);
        }
    }

    function executeTransaction(uint _txId) public onlyOwner transactionExists(_txId) notExecuted(_txId) {
        Transaction storage txn = transactions[_txId];
        require(txn.numOfApprovals >= quorum, "Not enough approvals");

        require(address(this).balance >= txn.amount, "Not enough ETH");

        txn.executed = true;
        (bool success, ) = payable(txn.to).call{value: txn.amount}(txn.data);
        require(success, "Transaction execution failed");

        emit TransactionExecuted(msg.sender, _txId, txn.to, txn.amount, txn.data);
    }
    function revokeApproval(uint _txId) public onlyOwner transactionExists(_txId) notExecuted(_txId) {
        require(approvals[_txId][msg.sender], "not yet approved");

        approvals[_txId][msg.sender] = false;
        Transaction storage txn = transactions[_txId];
        txn.numOfApprovals -= 1;

        emit TransactionRevoke(msg.sender, _txId);
    }
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    receive() external payable {
        emit TransactionProposed(transactions.length, msg.sender, address(this), msg.value, "");
    }

    function getAuthorizedSigners() public view returns (address[] memory) {
        return authorizedSigners;
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }
}

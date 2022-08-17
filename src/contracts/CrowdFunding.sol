// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract CrowdFunding { 

    // Contributors
    mapping(address => uint) public Contributors;
    // onwer (in this example it's the manager)
    address public manager;
    // minimum amount of contribution
    uint public minContribution;
    // deadLine
    uint public deadLine;
    // taget sum
    uint public target;
    // raise amount
    uint public raiseAmount;
    // number of Contributors
    uint public numOfContributors;
    // number of Requests
    uint public numOfRequests;

    struct Request{
        string description;
        address payable recipient;
        uint value;
        bool isCompleted;
        uint numberOfVoters;
        mapping(address => bool ) voters;
    }

    mapping(uint => Request) public requests;

    constructor(uint _target, uint _deadLine) {
        target = _target;
        deadLine = block.timestamp + _deadLine; // timestamp of the block + deadLine (in seconds)
        minContribution = 100000 gwei; // = 0,0001 ETH
        manager = msg.sender;
    }

    // contribution function
    function sendEth() public payable {

        // check the deadline
        require(block.timestamp < deadLine,"Out of deadline");

        // check if the amount is >= of minContribution
        require(msg.value >= minContribution,"Minimum contribution not met" );

        // increment the number of contributors
        if(Contributors[msg.sender] == 0){
            numOfContributors++;
        }

        // increase the amount send by the user
        Contributors[msg.sender] += msg.value;

        // increase the overall amount 
        raiseAmount += msg.value;
    }
     
    // current amount
    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    function refund() public {
        // check deadLine & rasieAmount
        require(block.timestamp > deadLine && raiseAmount < target);
        // check if the user who initialize the refund is a Contributor
        require(Contributors[msg.sender]>0);
        // making msg.sender a payable
        address payable user = payable(msg.sender);
        // transfer the amount of contribution to the contributor who initialize the refund
        user.transfer(Contributors[msg.sender]);
        Contributors[msg.sender]= 0;
    }

    // making a request (only the manager can make this request)
    function makeRequest(string memory _description, address payable _recipient, uint _value) public {
        require(msg.sender == manager, "Only the manager can make this request");
        Request storage newRequest = requests[numOfRequests];
        numOfRequests++;
        newRequest.description = _description;
        newRequest.recipient = _recipient;
        newRequest.value = _value;
        newRequest.isCompleted = false;
        newRequest.numberOfVoters = 0;
    }

    // voting function
    function voting (uint _numOfRequest) public {
        require(Contributors[msg.sender]>0, "You should be a contributors");
        Request storage thisRequest = requests[_numOfRequest];
        require(thisRequest.voters[msg.sender] == false , "You have already voted");
        thisRequest.voters[msg.sender] = false;
        thisRequest.numberOfVoters++;
    }

    // make a payment
    function makePayment(uint _numOfRequest) public {
        require(raiseAmount >= target);
        require(msg.sender == manager);
        Request storage thisRequest = requests[_numOfRequest];
        require(thisRequest.isCompleted == false, "The payment already done");
        require(thisRequest.numberOfVoters > numOfContributors /2, "Majority does not support");
        thisRequest.recipient.transfer(thisRequest.value);
        thisRequest.isCompleted = true;
    }

}
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Oubatoken.sol";
import "./Dummy_Oubatoken.sol";

contract StakingDapp {
    string public name ="Staking Dapp";
    address public owner;
    DummyOubaToken public dummy;
    OubaToken public ouba;


    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasstaked;
    mapping(address => bool) public isstaked;

    constructor(DummyOubaToken _dummy,OubaToken _ouba) public {
        dummy = _dummy;
        ouba = _ouba;
        owner = msg.sender;
    }

    function stakeToken(uint _amount) public {
        require(_amount>0, "Amount can't be zero");
        ouba.transferfrom(msg.sender, address(this), _amount);
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        if(!hasstaked[msg.sender]){
            stakers.push(msg.sender);
        }

        isstaked[msg.sender] = true;
        hasstaked[msg.sender] = true;
    }

    function unstaketoken() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0 , "Staking balance is zero");
        ouba.transfer(msg.sender, balance);
        stakingBalance[msg.sender] = 0;
        isstaked[msg.sender] = false;
    }

    function isEligibleToRewards() public {
        require(msg.sender == owner ,"you must be the owner");
        for (uint i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0) {
                dummy.transfer(recipient, balance);
            }
        }
    }

}
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Ouba.sol";
import "./Rewards.sol";

contract Staking {
    string public name ="Staking Dapp";
    address public owner;
    Rewards public dummy;
    Ouba public ouba;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasstaked;
    mapping(address => bool) public isstaked;

    constructor (Rewards _dummy,Ouba _ouba) {
        dummy = _dummy;
        ouba = _ouba;
        owner = msg.sender;
    }
    
    // stake Token
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

    // unstake Token
    function unstakeToken() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0 , "Staking balance is zero");
        ouba.transfer(msg.sender, balance);
        stakingBalance[msg.sender] = 0;
        isstaked[msg.sender] = false;
    }

    // check if eligible to rewards
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
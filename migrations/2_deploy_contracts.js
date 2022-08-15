const Rewards_Token = artifacts.require("RewardsToken");
const Ouba_Token = artifacts.require("Ouba");
const Staking_Dapp = artifacts.require("StakingDapp");

module.exports = async function (deployer, network, accounts) {
  // deploy Ouba_Token
  await deployer.deploy(Ouba_Token);
  const oubaToken = await Ouba_Token.deployed();

  // deploy RewardsToken
  await deployer.deploy(Rewards_Token);
  const rewardsToken = await Rewards_Token.deployed();

  // deploy StakingDapp : add two param of the constructor (DummyOubaToken + OubaToken)
  await deployer.deploy(Staking_Dapp, rewardsToken.address, oubaToken.address);
  const stakingDapp = await Staking_Dapp.deployed();

  // trasnfert rewardsToken to StakingDapp
  await rewardsToken.transfer(stakingDapp.address, "1000000000000000000000000");

  // trasnfert OubaToken to the first Ganache account (only 100 token in this example)
  await oubaToken.transfer(accounts[1], "100000000000000000000");
};

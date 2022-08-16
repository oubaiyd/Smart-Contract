const Staking = artifacts.require("Staking");

module.exports = async function (callback) {
  let staking = await Staking.deployed();
  await staking.isEligibleToRewards();
  console.log("token issued");
  callback();
};

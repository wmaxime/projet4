const Staking = artifacts.require("Staking");

module.exports = async function (deployer) {
  await deployer.deploy(Staking, "0x9b10E3FE54f07a8c00292Dda2827E823D7ec79A3", "0x4C4f8f016Ad8acFdbA06c5B91D6C1a7Fe86DFE50");
};

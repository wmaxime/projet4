const EVCT = artifacts.require("EVCT");
const Vault = artifacts.require("Vault");
const Staking = artifacts.require("Staking")

module.exports = async function (deployer) {
    deployer.deploy(EVCT);
    deployer.deploy(Vault);

    const token = await EVCT.deployed();
    const vault = await Vault.deployed();
    await deployer.deploy(Staking, token.address, vault.address);
};
const EVCT = artifacts.require("EVCT");
const Vault = artifacts.require("Vault");
const Staking = artifacts.require("Staking");

module.exports = async function (deployer) {
    await deployer.deploy(EVCT);
    await deployer.deploy(Vault);

    const token = await EVCT.deployed();
    const vault = await Vault.deployed();
    console.log("ADRESS VAULT ============== " + vault.address);
    await deployer.deploy(Staking, token.address, vault.address);
};
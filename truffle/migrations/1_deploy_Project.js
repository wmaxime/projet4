const EVCT = artifacts.require("EVCT");
const Vault = artifacts.require("Vault");
const Staking = artifacts.require("Staking");

const Ganache1 = "0x18331b19cbaeCcCf9cc65366db7dcf7955eBb7d0";
const Ganache2 = "0x54274c9bb92d40A7ad6b2c36A1e3d95837046560";

module.exports = async function (deployer, accounts) {
    await deployer.deploy(EVCT);
    await deployer.deploy(Vault);

    const token = await EVCT.deployed();
    const vault = await Vault.deployed();
    //console.log("ADRESS VAULT ============== " + vault.address);
    await deployer.deploy(Staking, token.address, vault.address);

    // Allow Owner as Admin
    console.log("ACCOUNT ============ " + accounts[1]);
    await token.addAdmin("0x21D0AC16fa378c0419bD8f80Fd09A91b005d9060");
    await token.mint("0x21D0AC16fa378c0419bD8f80Fd09A91b005d9060", 55555);

    // Mint or Ganache users
    await token.mint(Ganache2, 22222);
    await token.mint(Ganache1, 11111);

};
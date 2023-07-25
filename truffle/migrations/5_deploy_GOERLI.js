const EVCT = artifacts.require("EVCT");
const Vault = artifacts.require("Vault");
const Staking = artifacts.require("Staking");

module.exports = async function (deployer, networks, accounts) {
    await deployer.deploy(EVCT);
    await deployer.deploy(Vault);

    const token = await EVCT.deployed();
    const vault = await Vault.deployed();
    await deployer.deploy(Staking, token.address, vault.address);
    const staking = await Staking.deployed();

    // Allow Owner as Admin
    const owner = "0x3db1D9176cc6a48CA9606072456aA993168561F8";
    const user1 = "0x0B55388568D8F0d38c13Ff88584963509158707A";
    const amount = 99999999;
    //console.log("ACCOUNT ============ " + owner);
 
    await token.addAdmin(owner);
    await token.mint(staking.address, amount * 3);
    await token.mint(owner, amount);
    //const balance = await token.balanceOf(accounts[0], { from:owner });
    //console.log("BALANCE OWNER ================= " + balance);

    //Mint or Ganache users
    await token.mint(user1, amount);

    //Approve
    //await token.approve(staking.address, amount, { from: owner });
    //await token.approve(staking.address, amount, { from: user1 });

};

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
    const owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const amount = 5000;
    //console.log("ACCOUNT ============ " + owner);
 
    await token.addAdmin(owner);
    await token.mint(owner, amount);
    //const balance = await token.balanceOf(accounts[0], { from:owner });
    //console.log("BALANCE OWNER ================= " + balance);

    //Mint or Ganache users
    await token.mint(user1, amount);
    await token.mint(user2, amount);

    //Approve
    await await token.approve(staking.address, amount, { from: owner });
    await await token.approve(staking.address, amount, { from: user1 });
    await await token.approve(staking.address, amount, { from: user2 });

};

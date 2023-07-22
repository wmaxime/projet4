const EVCT = artifacts.require("EVCT");
const Staking = artifacts.require("Staking");
const Vault = artifacts.require("Vault");
const { BN, expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Stacking', (accounts) => {

    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    const tokenSymbol = "EVCT";
    const amount = 1000;
    const apr = new BN(150);
    const fees = new BN(3);
    const minimumRewards = new BN(200);

    let TokenInstance;
    let StakingInstance;
    let VaultInstance;

    describe("Create Token contract, Vault contract then Staking contract", function () {
      beforeEach(async function () {
        TokenInstance = await EVCT.new({ from: owner });
        await TokenInstance.addAdmin(owner, { from: owner });
        VaultInstance = await Vault.new({ from: owner });
        StakingInstance = await Staking.new(TokenInstance.address, VaultInstance.address, { from: owner });
      });

      it("STAKING contract should receive token", async () => {
        await TokenInstance.mint(StakingInstance.address, new BN(amount), { from: owner });
        const storedData = await TokenInstance.balanceOf(StakingInstance.address, { from: owner });
        expect(storedData).to.be.bignumber.equal(new BN(amount));
      });

      it("VAULT contract should receive token", async () => {
        await TokenInstance.mint(VaultInstance.address, new BN(amount), { from: owner });
        const storedData = await TokenInstance.balanceOf(VaultInstance.address, { from: owner });
        expect(storedData).to.be.bignumber.equal(new BN(amount));
      });

      it("VAULT : By default, contract should be locked", async function () {
        const storedData = await VaultInstance.locked.call({ from: owner })
        expect(storedData).to.be.true;
      });

      it("VAULT : Only owner should UNLOCK contract, revert", async function () {
        await expectRevert(VaultInstance.unlock({ from: account1 }), "Ownable: caller is not the owner");
      });

      it("VAULT : Owner should UNLOCK contract", async function () {
        await VaultInstance.unlock({ from: owner });
        const storedData = await VaultInstance.locked.call({ from: owner })
        expect(storedData).to.be.false;
      });
      
      it("Check Emit : Unlocked", async () => {
        const findEvent = await VaultInstance.unlock({ from: owner });
        expectEvent(findEvent, "Unlocked");
      });

      it("VAULT : Only owner should LOCK contract, revert", async function () {
        await expectRevert(VaultInstance.lock({ from: account1 }), "Ownable: caller is not the owner");
      });

      it("VAULT : Owner should LOCK contract", async function () {
        await VaultInstance.lock({ from: owner });
        const storedData = await VaultInstance.locked.call({ from: owner })
        expect(storedData).to.be.true;
      });

      it("Check Emit : Locked", async () => {
        const findEvent = await VaultInstance.lock({ from: owner });
        expectEvent(findEvent, "Locked");
      });

      it("VAULT : Only Owner should WITHDRAW", async () => {
        await TokenInstance.mint(VaultInstance.address, new BN(amount), { from: owner });
        //const storedData = await TokenInstance.balanceOf(VaultInstance.address, { from: owner });
        await expectRevert(VaultInstance.withdrawToken(TokenInstance.address, new BN(amount), { from: account1 }), "Ownable: caller is not the owner");
      });

      it("VAULT : Owner should WITHDRAW and balance of Owner shoudl be equal to amount", async function () {
        await TokenInstance.mint(VaultInstance.address, new BN(amount), { from: owner });
        await VaultInstance.unlock({ from: owner });
        await VaultInstance.withdrawToken(TokenInstance.address, new BN(amount), { from: owner });
        const storedData = await TokenInstance.balanceOf(owner, { from: owner });
        expect(storedData).to.be.bignumber.equal(new BN(amount));
      });
      
 /*     it("VAULT : Owner should transfer Ownership to Staking contract address", async function () {
        await VaultInstance.transferOwnership(StakingInstance.address, { from: owner });
        const storedData = await VaultInstance.owner.call({ from: owner });
        console.log("CREATOR OWNER ======== " + owner + " ////// STAKING ADDRESS ============ " + StakingInstance.address);
        expect(storedData).to.be.equal(StakingInstance.address);
      });
*/
      it("CREATEPOOL : Only owner can create pool, revert", async function () {
        await expectRevert( StakingInstance.createLiquidityPool(StakingInstance.address, apr, fees, minimumRewards, tokenSymbol, { from: account1 }), "Ownable: caller is not the owner");
      });

      it("CREATEPOOL : Should create a pool", async () => {
        await StakingInstance.createLiquidityPool(TokenInstance.address, apr, fees, minimumRewards, tokenSymbol, { from: owner });
        const storedData = await StakingInstance.getPoolData(TokenInstance.address, { from: owner });
        expect(storedData.isCreated).to.be.true;
      });
      
      it("Check Emit : PoolCreated", async () => {
        const findEvent = await StakingInstance.createLiquidityPool(StakingInstance.address, apr, fees, minimumRewards, tokenSymbol, { from: owner });
        expectEvent(findEvent, "PoolCreated", {tokenAddress: StakingInstance.address, apr: apr, fees: fees, minimumClaim: minimumRewards, symbol: tokenSymbol});
      });
      
      it("Require CREATEPOOL : Pool must not exist", async () => {
        await StakingInstance.createLiquidityPool(TokenInstance.address, apr, fees, minimumRewards, tokenSymbol, { from: owner });
        await expectRevert(StakingInstance.createLiquidityPool(TokenInstance.address, apr, fees, minimumRewards, tokenSymbol, { from: owner }), "This pool is already created");
      });

      it("Require SETPOOLPAUSED : Pool must be created", async () => {
        await expectRevert(StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner }), "This pool is not created");
      });

      it("SETPOOLPAUSED : Only owner can change pool paused status, revert", async function () {
        await StakingInstance.createLiquidityPool(TokenInstance.address, apr, fees, minimumRewards, tokenSymbol, { from: owner });
        await expectRevert( StakingInstance.setPoolPaused(TokenInstance.address, false, { from: account1 }), "Ownable: caller is not the owner" );
      });
      
      it("SETPOOLPAUSED : Should change pool paused status", async function () {
        await StakingInstance.createLiquidityPool(TokenInstance.address, apr, fees, minimumRewards, tokenSymbol, { from: owner });
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        const storedData = await StakingInstance.getPoolData(TokenInstance.address, { from: owner });
        expect(storedData.paused).to.be.false;
      });
      
      it("Check Emit : PausedPoolStatus", async () => {
        await StakingInstance.createLiquidityPool(TokenInstance.address, apr, fees, minimumRewards, tokenSymbol, { from: owner });
        const findEvent = await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        expectEvent(findEvent, "PausedPoolStatus", {tokenAddress: TokenInstance.address, pausedStatus: false});
      });


    });

    describe("Check STAKING DEPOSIT", function () {
      beforeEach(async function () {
        TokenInstance = await EVCT.new({ from: owner });
        await TokenInstance.addAdmin(owner, { from: owner });
        await TokenInstance.mint(account1, new BN(amount), { from: owner });
        await TokenInstance.mint(account2, new BN(amount), { from: owner });
        VaultInstance = await Vault.new({ from: owner });
        StakingInstance = await Staking.new(TokenInstance.address, VaultInstance.address, { from: owner });
        await TokenInstance.mint(StakingInstance.address, new BN(amount), { from: owner });
        await StakingInstance.createLiquidityPool(TokenInstance.address, apr, fees, minimumRewards, tokenSymbol, { from: owner });
      });

      it("Require DEPOSIT : amount must be over zero", async () => {
        await expectRevert(StakingInstance.deposit(0, TokenInstance.address, { from: account1 }), "Amount must be over zero");
      });
 
      it("Require DEPOSIT : staker must approve from token instance the address of staking contract with the amount to deposit", async () => {
        await expectRevert(StakingInstance.deposit(amount, TokenInstance.address, { from: account1 }), "ERC20: insufficient allowance");
      });

      it("Require DEPOSIT : Pool must not be paused", async () => {
        await TokenInstance.approve(StakingInstance.address, amount, { from: account1 });
        await expectRevert(StakingInstance.deposit(amount, TokenInstance.address, { from: account1 }), "Pool must be unpaused");
      });
      
      it("DEPOSIT : Staker should be able to deposit and userStorage.stakedAmount=amount", async function () {
        await TokenInstance.approve(StakingInstance.address, amount, { from: account1 });
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        await StakingInstance.deposit(amount, TokenInstance.address, { from: account1 });
        const storedData = await StakingInstance.userInfo.call(TokenInstance.address, account1, { from: account1 });
        expect(storedData.stakedAmount).to.be.bignumber.equal(new BN(amount));
      });

      it("DEPOSIT : Staker should be able to deposit and poolStorage.totalValueLocked=amount", async function () {
        await TokenInstance.approve(StakingInstance.address, amount, { from: account1 });
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        await StakingInstance.deposit(amount, TokenInstance.address, { from: account1 });
        const storedData = await StakingInstance.poolData.call(TokenInstance.address, { from: account1 });
        expect(storedData.totalValueLocked).to.be.bignumber.equal(new BN(amount));
      });

      it("DEPOSIT : 2 Stakers should be able to deposit separately and poolStorage.totalValueLocked = amount of the 2 deposit", async function () {
        await TokenInstance.approve(StakingInstance.address, amount, { from: account1 });
        await TokenInstance.approve(StakingInstance.address, amount, { from: account2 });
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        await StakingInstance.deposit(amount, TokenInstance.address, { from: account1 });
        await StakingInstance.deposit(500, TokenInstance.address, { from: account2 });
        const storedData = await StakingInstance.poolData.call(TokenInstance.address, { from: account1 });
        const value = amount + 500;
        expect(storedData.totalValueLocked).to.be.bignumber.equal(new BN(value));
      });

      it("Check Emit : Deposited", async () => {
        await TokenInstance.approve(StakingInstance.address, amount, { from: account1 });
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        const findEvent = await StakingInstance.deposit(amount, TokenInstance.address, { from: account1 });
        expectEvent(findEvent, "Deposited", {amount: new BN(amount), asset: TokenInstance.address, user: account1});
      });
    });

    describe("Check STAKING WITHDRAW", function () {
      let firstDepositTimestamp;
      beforeEach(async function () {
        TokenInstance = await EVCT.new({ from: owner });
        await TokenInstance.addAdmin(owner, { from: owner });
        await TokenInstance.mint(account1, new BN(amount), { from: owner });
        await TokenInstance.mint(account2, new BN(amount), { from: owner });
        VaultInstance = await Vault.new({ from: owner });
        StakingInstance = await Staking.new(TokenInstance.address, VaultInstance.address, { from: owner });
        await TokenInstance.mint(StakingInstance.address, new BN(amount), { from: owner });
        await StakingInstance.createLiquidityPool(TokenInstance.address, apr, fees, minimumRewards, tokenSymbol, { from: owner });
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        await TokenInstance.approve(StakingInstance.address, amount, { from: account1 });
        await TokenInstance.approve(StakingInstance.address, amount, { from: account2 });
        await StakingInstance.deposit(amount, TokenInstance.address, { from: account1 });
        await StakingInstance.deposit(500, TokenInstance.address, { from: account2 });
        await StakingInstance.setPoolPaused(TokenInstance.address, true, { from: owner });
        firstDepositTimestamp = await StakingInstance.userInfo.call(TokenInstance.address, account1, { from: account1 });
      });

      it("Require WITHDRAW : Pool must not be paused", async () => {
        await expectRevert(StakingInstance.withdraw(TokenInstance.address, amount, { from: account1 }), "Pool must be unpaused");
      });
 
      it("Require WITHDRAW : withdraw amount must be less than user staked amount", async () => {
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        const overAmount = amount + 500;
        await expectRevert(StakingInstance.withdraw(TokenInstance.address, overAmount, { from: account1 }), "The amount is over your balance in this pool");
      });
      
      it("WITHDRAW : Staker should be able to withdraw and get back the amount", async function () {
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        await StakingInstance.withdraw(TokenInstance.address, amount, { from: account1 })
        const storedData = await TokenInstance.balanceOf.call(account1, { from: account1 });
        expect(storedData).to.be.bignumber.equal(new BN(amount));
      });

      it("WITHDRAW : Staker should be able to withdraw and userStorage.stakedAmount=0", async function () {
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        await StakingInstance.withdraw(TokenInstance.address, amount, { from: account1 })
        const storedData = await StakingInstance.userInfo.call(TokenInstance.address, account1, { from: account1 });
        expect(storedData.stakedAmount).to.be.bignumber.equal(new BN(0));
      });

      it("WITHDRAW : Staker should be able to withdraw and userStorage.lastStakedTimestamp should be increase", async function () {
        //console.log("OLD TIMESTAMP ============= " + firstDepositTimestamp.lastStakedTimestamp);
        let duration = time.duration.seconds(3);
        await time.increase(duration);
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        await StakingInstance.deposit(500, TokenInstance.address, { from: account2 });
        await StakingInstance.withdraw(TokenInstance.address, amount, { from: account1 })
        const storedData = await StakingInstance.userInfo.call(TokenInstance.address, account1, { from: account1 });
        //console.log("NEW TIMESTAMP ============= " + storedData.lastStakedTimestamp);
        expect(storedData.lastStakedTimestamp).to.be.bignumber.above(new BN(firstDepositTimestamp.lastStakedTimestamp));
      });

      it("WITHDRAW : Staker should be able to withdraw and poolStorage.totalValueLocked decrease by the withdraw value", async function () {
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        await StakingInstance.withdraw(TokenInstance.address, amount, { from: account1 })
        const storedData = await StakingInstance.poolData.call(TokenInstance.address, { from: account1 });
        expect(storedData.totalValueLocked).to.be.bignumber.equal(new BN(500));
      });

      it("Check Emit : Withdrawn", async () => {
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        const findEvent = await StakingInstance.withdraw(TokenInstance.address, amount, { from: account1 });
        expectEvent(findEvent, "Withdrawn", {receiver: account1, tokenAddress: TokenInstance.address, amountWithdraw: new BN(amount)});
      });
    });

    describe("Check STAKING CLAIM", function () {
      let firstDepositTimestamp;
      beforeEach(async function () {
        TokenInstance = await EVCT.new({ from: owner });
        await TokenInstance.addAdmin(owner, { from: owner });
        await TokenInstance.mint(account1, new BN(amount), { from: owner });
        VaultInstance = await Vault.new({ from: owner });
        StakingInstance = await Staking.new(TokenInstance.address, VaultInstance.address, { from: owner });
        await TokenInstance.mint(StakingInstance.address, new BN(amount), { from: owner });
        await StakingInstance.createLiquidityPool(TokenInstance.address, apr, fees, minimumRewards, tokenSymbol, { from: owner });
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        await TokenInstance.approve(StakingInstance.address, amount, { from: account1 });
        await StakingInstance.deposit(amount, TokenInstance.address, { from: account1 });
        await StakingInstance.setPoolPaused(TokenInstance.address, true, { from: owner });
        firstDepositTimestamp = await StakingInstance.userInfo.call(TokenInstance.address, account1, { from: account1 });
      });

      it("Require CLAIM : Pool must not be paused", async () => {
        await expectRevert(StakingInstance.claimReward(TokenInstance.address, { from: account1 }), "Pool must be unpaused");
      });

      it("Require CLAIM : Rewards amount must be over zero", async () => {
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        await expectRevert(StakingInstance.claimReward(TokenInstance.address, { from: account1 }), "No reward to claim");
      });

      it("Require CLAIM : Rewards amount must be >= poolStorage.minimumClaim", async () => {
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        let duration = time.duration.days(30);
        await time.increase(duration);
        const storedData = await StakingInstance.calculateReward(TokenInstance.address, account1, { from: account1 });
        const PoolStoredData = await StakingInstance.poolData.call(TokenInstance.address, { from: account1 });
        console.log("MINIMUM AMOUNT ============ " + PoolStoredData.minimumClaim);
        console.log("REWARDS AMOUNT ============ " + new BN(storedData/1e18));
        await expectRevert(StakingInstance.claimReward(TokenInstance.address, { from: account1 }), "Not enough minimum rewards to claim");
      });
      
      it("CLAIM : Staker should claim and receive rewards amount in his address balance", async function () {
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        let duration = time.duration.days(90);
        await time.increase(duration);
        const rewardAmount = await StakingInstance.calculateReward(TokenInstance.address, account1, { from: account1 });
        await StakingInstance.claimReward(TokenInstance.address, { from: account1 });
        const storedData = await TokenInstance.balanceOf.call(account1, { from: account1 });
        expect(storedData).to.be.bignumber.equal(new BN(rewardAmount/1e18));
      });

      it("CLAIM : Staker should be able to claim and userStorage.lastStakedTimestamp should be increase", async function () {
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        let duration = time.duration.days(90);
        await time.increase(duration);
        await StakingInstance.claimReward(TokenInstance.address, { from: account1 });
        const storedData = await StakingInstance.userInfo.call(TokenInstance.address, account1, { from: account1 });
        expect(storedData.lastStakedTimestamp).to.be.bignumber.above(new BN(firstDepositTimestamp.lastStakedTimestamp));
      });

      it("Check Emit : Claimed", async () => {
        await StakingInstance.setPoolPaused(TokenInstance.address, false, { from: owner });
        let duration = time.duration.days(90);
        await time.increase(duration);
        const storedData = await StakingInstance.calculateReward(TokenInstance.address, account1, { from: account1 });
        //const PoolStoredData = await StakingInstance.poolData.call(TokenInstance.address, { from: account1 });
        //console.log("MINIMUM AMOUNT ============ " + PoolStoredData.minimumClaim);
        //console.log("REWARDS AMOUNT ============ " + new BN(storedData/1e18));
        const findEvent = await StakingInstance.claimReward(TokenInstance.address, { from: account1 });
        expectEvent(findEvent, "Claimed", {receiver: account1, tokenAddress: TokenInstance.address, rewardClaimedAmount: new BN(storedData/1e18)});
      });

    });

});

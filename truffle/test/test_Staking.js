const EVCT = artifacts.require("EVCT");
const Staking = artifacts.require("Staking");
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
    const minimumRewards = new BN(BigInt(200 * 10 ** 18));

    let TokenInstance;
    let StakingInstance;

    describe("Create Token contract then Staking contract", function () {
      beforeEach(async function () {
        TokenInstance = await EVCT.new({ from: owner });
        await TokenInstance.addAdmin(owner, { from: owner });
        StakingInstance = await Staking.new(TokenInstance.address, { from: owner });
      });

      it("Staking contract should receive token", async () => {
        await TokenInstance.mint(StakingInstance.address, new BN(amount), { from: owner });
        const storedData = await TokenInstance.balanceOf(StakingInstance.address, { from: owner });
        expect(storedData).to.be.bignumber.equal(new BN(amount));
      });

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
        StakingInstance = await Staking.new(TokenInstance.address, { from: owner });
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
        StakingInstance = await Staking.new(TokenInstance.address, { from: owner });
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
        expectEvent(findEvent, "Withdrawn", {sender: account1, tokenAddress: TokenInstance.address, amountWithdraw: new BN(amount)});
      });
    });

});

const EVCT = artifacts.require("EVCT");
//const Staking = artifacts.require("Staking");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('EVCT', (accounts) => {

    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    const tokenName = "EV Charging Token";
    const tokenSymbol = "EVCT";
    const tokenDecimals = "18";

    let TokenInstance;

    describe("Token properties", function () {
      beforeEach(async function () {
        TokenInstance = await EVCT.new({ from: owner });
      });

      it("Get token name", async () => {
        const storedData = await TokenInstance.name();
        expect(storedData).to.be.equal(tokenName);
      });

      it("Get token symbol", async () => {
        const storedData = await TokenInstance.symbol();
        expect(storedData).to.be.equal(tokenSymbol);
      });

      it("Get token decimals", async () => {
        const storedData = await TokenInstance.decimals();
        expect(storedData).to.be.bignumber.equal(new BN(tokenDecimals));
      });

      it("Get token totalSupply", async () => {
        const storedData = await TokenInstance.totalSupply();
        expect(storedData).to.be.bignumber.equal(new BN(0));
      });
    });

    describe("Check addAdmin, getAdmin", function () {
      beforeEach(async function () {
        TokenInstance = await EVCT.new({ from: owner });
      });

      it("Only owner can add admin, revert", async () => {
        expectRevert(TokenInstance.addAdmin(account1, { from: account1 }), "Ownable: caller is not the owner");
      });

      it("Should add Admin, get admin", async () => {
        await TokenInstance.addAdmin(owner, { from: owner });
        const storedData = await TokenInstance.getAdmin(owner, { from: owner });
        expect(storedData).to.be.true;
      });
    });

    describe("Check removeAdmin", function () {
      beforeEach(async function () {
        TokenInstance = await EVCT.new({ from: owner });
        await TokenInstance.addAdmin(account1, { from: owner });
      });
      
      it("Only owner can remove admin, revert", async () => {
        expectRevert(TokenInstance.removeAdmin(account1, { from: account1 }), "Ownable: caller is not the owner");
      });

      it("Should remove admin", async () => {
        await TokenInstance.removeAdmin(account1, { from: owner });
        const storedData = await TokenInstance.getAdmin(account1, { from: owner });
        expect(storedData).to.be.false;
      });
    });

    describe("Check mint, balanceOf", function () {
      beforeEach(async function () {
        TokenInstance = await EVCT.new({ from: owner });
        await TokenInstance.addAdmin(owner, { from: owner });
      });

      it("Require : Only admins can mint", async () => {
        expectRevert(TokenInstance.mint(account2, new BN(1000), { from: account1 }), "You are not admin");
      });

      it("Should mint", async () => {
        const amount = 1000;
        await TokenInstance.mint(account1, new BN(amount), { from: owner });
        const storedData = await TokenInstance.balanceOf(account1, { from: owner });
        expect(storedData).to.be.bignumber.equal(new BN(amount));
      });

    });

});

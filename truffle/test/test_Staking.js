const EVCT = artifacts.require("EVCT");
const Staking = artifacts.require("Staking");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Stacking', (accounts) => {

    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    const tokenName = "EV Charging Token";
    const tokenSymbol = "EVCT";
    const tokenDecimals = "18";

    let TokenInstance;
    let StakingInstance;

    describe("Create Token contract then Staking contract", function () {
      beforeEach(async function () {
        TokenInstance = await EVCT.new({ from: owner });
        await TokenInstance.addAdmin(owner, { from: owner });
        StakingInstance = await Staking.new(TokenInstance.address, { from: owner });
      });

      it("Staking contract should receive token", async () => {
        const amount = 1000;
        await TokenInstance.mint(StakingInstance.address, new BN(amount), { from: owner });
        const storedData = await TokenInstance.balanceOf(StakingInstance.address, { from: owner });
        expect(storedData).to.be.bignumber.equal(new BN(amount));
      });

      it('Only owner can create pool, revert', async function () {
        await expectRevert( StakingInstance.createLiquidityPool(StakingInstance.address, 150, 3, 200e18, "EVCT", {from: account1}), 'Ownable: caller is not the owner' );
      });
    });

});

const EVCT = artifacts.require("EVCT");
//const Staking = artifacts.require("Staking");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('EVCT', (accounts) => {

    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];

    let TokenInstance;

    describe("test addAdmin, getAdmin, mint", function () {

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

      /*        it("Only owner can remove admin, revert", async () => {
          expectRevert(TokenInstance.removeAdmin(owner, { from: owner }), "Ownable: caller is not the owner");
        });

  it("Should remove Admin, get admin", async () => {
          await TokenInstance.addAdmin(account1, { from: owner });
          await TokenInstance.removeAdmin(account1, { from: owner });
          const storedData = await TokenInstance.getAdmin(account1, { from: owner });
          expect(storedData).to.be.false;
        }); */

        it("Only owner can mint EVCT token, revert", async () => {
          expectRevert(TokenInstance.mint(owner, 123, { from: owner }), "You are not admin");
        });

        it("Admin Should mint and get EVCT token", async () => {
          const amount = 200;
          await TokenInstance.addAdmin(owner, { from: owner });
          await TokenInstance.mint(account1, amount, { from: owner });
          const storedData = await TokenInstance.balanceOf(account1, { from: owner });
          expect(storedData).to.be.bignumber.equal(new BN(amount));
        });
    });

});

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Staking is Ownable {

    struct LiquidityPoolData {
        bool isCreated;
        uint rewardPerSecond;
        //address oracleAggregatorAddress;
        uint totalValueLocked;
        string symbol;
    }

    mapping(address => LiquidityPoolData) liquidityPoolData;

    event PoolCreated (address tokenAddress, uint rewardPerSecond, string symbol);

    //function createLiquidityPool(address _tokenAddress, address _oracleAggregatorAddress, uint _rewardPerSecond, string calldata _symbol) external onlyOwner {
    function createLiquidityPool(address _tokenAddress, uint _rewardPerSecond, string calldata _symbol) external onlyOwner {
        require(!liquidityPoolData[_tokenAddress].isCreated, "This pool is already created");

        liquidityPoolData[_tokenAddress].rewardPerSecond = _rewardPerSecond;
        //liquidityPoolData[_tokenAddress].oracleAggregatorAddress = _oracleAggregatorAddress;
        liquidityPoolData[_tokenAddress].isCreated = true;
        liquidityPoolData[_tokenAddress].symbol = _symbol;

        emit PoolCreated(_tokenAddress, _rewardPerSecond, _symbol);
    }

}
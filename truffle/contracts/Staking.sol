// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Staking is Ownable {

    struct UserInfo {
        uint256 stakedAmount; 
        uint256 updateTimestamp;
        uint256 reward;
    }

    struct PoolData {
        bool isCreated;
        uint rewardPerSecond;
        //address oracleAggregatorAddress;
        uint totalValueLocked;
        string symbol;
    }

    // Map token adress
    mapping(address => PoolData) poolData;
    // Map token adress then user address
    mapping (address => mapping (address => UserInfo)) public userInfo;
    
    event PoolCreated (address tokenAddress, uint rewardPerSecond, string symbol);
    event Deposited(uint amount, address asset, address user);

    //function createLiquidityPool(address _tokenAddress, address _oracleAggregatorAddress, uint _rewardPerSecond, string calldata _symbol) external onlyOwner {
    function createLiquidityPool(address _tokenAddress, uint _rewardPerSecond, string calldata _symbol) external onlyOwner {
        require(!poolData[_tokenAddress].isCreated, "This pool is already created");

        poolData[_tokenAddress].rewardPerSecond = _rewardPerSecond;
        //poolData[_tokenAddress].oracleAggregatorAddress = _oracleAggregatorAddress;
        poolData[_tokenAddress].isCreated = true;
        poolData[_tokenAddress].symbol = _symbol;

        emit PoolCreated(_tokenAddress, _rewardPerSecond, _symbol);
    }


    // Dans Remix utiliser IERC20 avec le parametre "At adress" adresse du token de rewards
    // puis dans l'interface "Approve" l'adresse du contrat de Staking et amout = 1000000000000000000 = 1 ETH
    function deposit(uint _amount, address _tokenAddress) external {
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
        IERC20(_tokenAddress).approve(address(this), _amount);

        // Get the liquidity pool data
        PoolData storage poolStorage = poolData[_tokenAddress];
        // Get the staker data
        //UserInfo storage userInfo = poolData.stakerData[msg.sender];
        UserInfo storage userStorage = userInfo[_tokenAddress][msg.sender];

        // Update the staked amount and the timestamp to compute new amount reward at this specific time
        userStorage.stakedAmount = userStorage.stakedAmount + _amount;
        userStorage.updateTimestamp = block.timestamp; 

        // Update the tvl of the liquidity pool
        poolStorage.totalValueLocked = poolStorage.totalValueLocked  + _amount;
        emit Deposited(_amount, _tokenAddress, msg.sender);
    }

}
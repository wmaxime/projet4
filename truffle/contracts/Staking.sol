// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Staking is Ownable {

    using SafeERC20 for IERC20; //https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#SafeERC20

    IERC20 private rewardToken;

    struct UserInfo {
        uint256 stakedAmount; 
        uint256 lastStakedTimestamp;
        uint256 reward;
    }

    struct PoolData {
        bool isCreated;
        uint256 apr;
        uint256 fees;
        //address oracleAggregatorAddress;
        uint256 totalValueLocked;
        string symbol;
    }

    // Map token adress
    mapping(address => PoolData) poolData;
    // Map token adress then user address
    mapping (address => mapping (address => UserInfo)) public userInfo;
    
    event PoolCreated (address tokenAddress, uint256 apr, uint256 fees, string symbol);
    event Deposited(uint256 amount, address asset, address user);
    event Withdrawn (address sender, address tokenAddress, uint256 stakedAmount);


    constructor (IERC20 _rewardToken) {
        rewardToken = _rewardToken;
    }

    function displayStakingDuration(address _tokenAddress, address _user) public view returns (uint256) {
        UserInfo storage userStorage = userInfo[_tokenAddress][_user];
        uint256 stakingDuration = block.timestamp - userStorage.lastStakedTimestamp; // not ideal cause latency but it is ok
        return stakingDuration;
    }

    function displayAmountRewardsInWei(address _tokenAddress, address _user) public view returns (uint256) {
        PoolData storage poolStorage = poolData[_tokenAddress];
        UserInfo storage userStorage = userInfo[_tokenAddress][_user];
        uint256 stakingDuration = block.timestamp - userStorage.lastStakedTimestamp; // not ideal cause latency but it is ok
        uint256 amountRewards = ((((userStorage.stakedAmount * 1e18 * poolStorage.apr) / 100) / 31536000) * stakingDuration);
        return amountRewards;
    }

    function displayFeesAmountInWei(address _tokenAddress, address _user) public view returns (uint256) {
        PoolData storage poolStorage = poolData[_tokenAddress];
        UserInfo storage userStorage = userInfo[_tokenAddress][_user];
        uint256 stakingDuration = block.timestamp - userStorage.lastStakedTimestamp; // not ideal cause latency but it is ok
        uint256 amountRewards = ((((userStorage.stakedAmount * 1e18 * poolStorage.apr) / 100) / 31536000) * stakingDuration);
        uint256 feesAmount = ((amountRewards * poolStorage.fees) /100);
        return feesAmount;
    }

    function calculateReward(address _tokenAddress, address _user) public view returns (uint256) {
        PoolData storage poolStorage = poolData[_tokenAddress];
        UserInfo storage userStorage = userInfo[_tokenAddress][_user];
        uint256 stakingDuration = block.timestamp - userStorage.lastStakedTimestamp; // not ideal cause latency but it is ok
        // calcul : amountRewards = staked amount * reward rate per second * elapsedtime
        // Be aware : amount multiply by 1e18 for decimal
        uint256 amountRewards = ((((userStorage.stakedAmount * 1e18 * poolStorage.apr) / 100) / 31536000) * stakingDuration);
        uint256 feesAmount = ((amountRewards * poolStorage.fees) /100);
        uint256 returnRewards = amountRewards - feesAmount;
        return returnRewards;
    }

    //function createLiquidityPool(address _tokenAddress, address _oracleAggregatorAddress, uint _rewardPerSecond, string calldata _symbol) external onlyOwner {
    function createLiquidityPool(address _tokenAddress, uint256 _apr, uint256 _fees, string calldata _symbol) external onlyOwner {
        require(!poolData[_tokenAddress].isCreated, "This pool is already created");

        poolData[_tokenAddress].apr = _apr;
        poolData[_tokenAddress].fees = _fees;
        //poolData[_tokenAddress].oracleAggregatorAddress = _oracleAggregatorAddress;
        poolData[_tokenAddress].isCreated = true;
        poolData[_tokenAddress].symbol = _symbol;

        emit PoolCreated(_tokenAddress, _apr, _fees, _symbol);
    }

    // Dans Remix utiliser IERC20 avec le parametre "At adress" adresse du token de rewards
    // puis dans l'interface "Approve" l'adresse du contrat de Staking et amout = 1000000000000000000 = 1 ETH
    function deposit(uint256 _amount, address _tokenAddress) external {
        
        require(_amount > 0, "Amount must be over zero");

        IERC20(_tokenAddress).safeTransferFrom(msg.sender, address(this), _amount);
        IERC20(_tokenAddress).safeApprove(address(this), _amount);

        // Get the liquidity pool data
        PoolData storage poolStorage = poolData[_tokenAddress];
        // Get the user data
        UserInfo storage userStorage = userInfo[_tokenAddress][msg.sender];

        // Update the staked amount and the timestamp to compute new amount reward at this specific time
        userStorage.stakedAmount = userStorage.stakedAmount + _amount;
        userStorage.lastStakedTimestamp = block.timestamp; 

        // Update the tvl of the liquidity pool
        poolStorage.totalValueLocked = poolStorage.totalValueLocked  + _amount;
        emit Deposited(_amount, _tokenAddress, msg.sender);
    }

    function withdraw(address _tokenAddress, uint256 _amount) external {
        
        // Get the liquidity pool data
        PoolData storage poolStorage = poolData[_tokenAddress];

        // Get the user data
        UserInfo storage userStorage = userInfo[_tokenAddress][msg.sender];
        
        // Check if the sender have this amount in pool
        require(_amount <= userStorage.stakedAmount, "The amount is over your balance in this pool.");

        // Update the staked amount and the timestamp to compute new amount reward at this specific time
        userStorage.stakedAmount = userStorage.stakedAmount - _amount;
        userStorage.lastStakedTimestamp = block.timestamp;

        // Update the tvl of the liquidity pool
        poolStorage.totalValueLocked = poolStorage.totalValueLocked  - _amount;

        // Send the token back to the sender
        IERC20(_tokenAddress).safeTransfer(msg.sender, _amount);
        
        emit Withdrawn(msg.sender, _tokenAddress, userStorage.stakedAmount);
    }

    function getBalance(address _tokenAddress) external view returns (uint stakedAmount) {
        return(userInfo[_tokenAddress][msg.sender].stakedAmount);
    }

}
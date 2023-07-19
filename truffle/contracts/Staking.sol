// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Staking is Ownable {

    //using SafeERC20 for IERC20; //https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#SafeERC20

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
        uint256 minimumClaim;
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
    event Withdrawn (address sender, address tokenAddress, uint256 amountWithdraw);
    event Claimed (address sender, address tokenAddress, uint rewardClaimedAmount);

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
        uint256 feesAmount = ((amountRewards * poolStorage.fees) / 100);
        return feesAmount;
    }

    function calculateReward(address _tokenAddress, address _user) public view returns (uint256) {
        PoolData storage poolStorage = poolData[_tokenAddress];
        UserInfo storage userStorage = userInfo[_tokenAddress][_user];
        uint256 stakingDuration = block.timestamp - userStorage.lastStakedTimestamp; // not ideal cause latency but it is ok
        // calcul : amountRewards = staked amount * reward rate per second * elapsedtime
        // Be aware : amount multiplication by 1e18 for decimal so need to divide by 1e18 in the front
        uint256 amountRewards = ((((userStorage.stakedAmount * 1e18 * poolStorage.apr) / 100) / 31536000) * stakingDuration);
        uint256 feesAmount = ((amountRewards * poolStorage.fees) / 100);
        uint256 returnRewards = amountRewards - feesAmount;
        return returnRewards;
    }

    //function createLiquidityPool(address _tokenAddress, address _oracleAggregatorAddress, uint _rewardPerSecond, string calldata _symbol) external onlyOwner {
    function createLiquidityPool(address _tokenAddress, uint256 _apr, uint256 _fees, uint256 _minimumClaim, string calldata _symbol) external onlyOwner {
        require(!poolData[_tokenAddress].isCreated, "This pool is already created");

        poolData[_tokenAddress].apr = _apr;
        poolData[_tokenAddress].fees = _fees;
        poolData[_tokenAddress].minimumClaim = _minimumClaim;
        poolData[_tokenAddress].isCreated = true;
        poolData[_tokenAddress].symbol = _symbol;
        //poolData[_tokenAddress].oracleAggregatorAddress = _oracleAggregatorAddress;

        emit PoolCreated(_tokenAddress, _apr, _fees, _symbol);
    }

    // Dans Remix utiliser IERC20 avec le parametre "At adress" adresse du token de rewards
    // puis dans l'interface "Approve" l'adresse du contrat de Staking et amout = 1000000000000000000 = 1 ETH
    function deposit(uint256 _amount, address _tokenAddress) external {
        //require(IERC20(_tokenAddress).allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
        require(_amount > 0, "Amount must be over zero");

        //IERC20(_tokenAddress).approve(address(this), _amount);
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);

        PoolData storage poolStorage = poolData[_tokenAddress];
        UserInfo storage userStorage = userInfo[_tokenAddress][msg.sender];

        // Update the staked amount and the timestamp to compute new amount reward at this specific time
        userStorage.stakedAmount = userStorage.stakedAmount + _amount;
        userStorage.lastStakedTimestamp = block.timestamp; 

        // Update the tvl of the liquidity pool
        poolStorage.totalValueLocked = poolStorage.totalValueLocked  + _amount;
        emit Deposited(_amount, _tokenAddress, msg.sender);
    }

    function withdraw(address _tokenAddress, uint256 _amount) external {
        PoolData storage poolStorage = poolData[_tokenAddress];
        UserInfo storage userStorage = userInfo[_tokenAddress][msg.sender];
        
        // Check if the sender have this amount in pool
        require(_amount <= userStorage.stakedAmount, "The amount is over your balance in this pool.");

        // save reward before withdraw to be able to claim it later
        userStorage.reward = (calculateReward(_tokenAddress, msg.sender) / 1e15); // for testing divide by 1e15 against 1e18

        // Update the staked amount and the timestamp to compute new amount reward at this specific time
        userStorage.stakedAmount = userStorage.stakedAmount - _amount;
        userStorage.lastStakedTimestamp = block.timestamp;

        // Update the tvl of the liquidity pool
        poolStorage.totalValueLocked = poolStorage.totalValueLocked  - _amount;

        // Send the token back to the sender
        //IERC20(_tokenAddress).approve(address(this), _amount);
        IERC20(_tokenAddress).transfer(msg.sender, _amount);
    
        emit Withdrawn(msg.sender, _tokenAddress, _amount);
    }

    function claimReward(address _tokenAddress) external {
        PoolData storage poolStorage = poolData[_tokenAddress];
        UserInfo storage userStorage = userInfo[_tokenAddress][msg.sender];

        // Compute the reward
        uint256 reward = (calculateReward(_tokenAddress, msg.sender) / 1e15); // for testing divide by 1e15 against 1e18
 
        require(reward > 0, "No reward to claim");
        require(reward >= poolStorage.minimumClaim, "Not enough minimum rewards to claim");
        
        // Update the timestamp and the reward amount
        userStorage.lastStakedTimestamp = block.timestamp;
        userStorage.reward = 0;

        // Send reward tokens to the msg.sender
        IERC20(_tokenAddress).transfer(msg.sender, reward);

        emit Claimed(msg.sender, _tokenAddress, reward);
    }

/*    function claimLastReward(address _tokenAddress) external {
        UserInfo storage userStorage = userInfo[_tokenAddress][msg.sender];

        uint256 reward = userStorage.reward;
        require(reward > 0, "No reward to claim");
        userStorage.reward = 0;
        userStorage.lastStakedTimestamp = block.timestamp;

        rewardToken.transfer(msg.sender, reward);
    }
*/
    function getUserBalance(address _tokenAddress) external view returns (uint256) {
        return(userInfo[_tokenAddress][msg.sender].stakedAmount);
    }

    function getUserReward(address _tokenAddress) external view returns (uint256) {
        return(userInfo[_tokenAddress][msg.sender].reward);
    }

    function getPoolTotalValueLocked(address _tokenAddress) external view returns (uint256) {
        PoolData storage poolStorage = poolData[_tokenAddress];
        return(poolStorage.totalValueLocked);
    }

    function getPoolApr(address _tokenAddress) external view returns (uint256) {
        PoolData storage poolStorage = poolData[_tokenAddress];
        return(poolStorage.apr);
    }

    function getPoolFees(address _tokenAddress) external view returns (uint256) {
        PoolData storage poolStorage = poolData[_tokenAddress];
        return(poolStorage.fees);
    }

    function getPoolMinimumClaim(address _tokenAddress) external view returns (uint256) {
        PoolData storage poolStorage = poolData[_tokenAddress];
        return(poolStorage.minimumClaim);
    }

}
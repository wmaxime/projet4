// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EVCT is ERC20, Ownable {

    mapping(address => bool) admins;

    event AdminAllowed(address adminAddress);
    event AdminRevoked(address adminAddress);

    constructor() ERC20("EV Charging Token", "EVCT") {}

    function mint(address recipient, uint256 amount) external {
        require(admins[msg.sender], "You are not admin");
        _mint(recipient, amount);
    }

    function addAdmin(address _admin) external onlyOwner {
        admins[_admin] = true;
        emit AdminAllowed(_admin);
    }

    function removeAdmin(address _admin) external onlyOwner {
        admins[_admin] = false;
        emit AdminRevoked(_admin);
    }

    function getAdmin(address _admin) external view returns (bool) {
        return admins[_admin];
    }
}
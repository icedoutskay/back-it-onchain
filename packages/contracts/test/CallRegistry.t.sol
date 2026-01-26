// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/CallRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock", "MCK") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract CallRegistryTest is Test {
    CallRegistry public registry;
    MockERC20 public token;
    address public user1 = address(0x1);
    address public user2 = address(0x2);

    function setUp() public {
        registry = new CallRegistry();
        token = new MockERC20();

        token.transfer(user1, 1000 * 10 ** 18);
        token.transfer(user2, 1000 * 10 ** 18);

        vm.prank(user1);
        token.approve(address(registry), type(uint256).max);

        vm.prank(user2);
        token.approve(address(registry), type(uint256).max);
    }

    function testCreateCall() public {
        vm.startPrank(user1);
        token.approve(address(registry), 100 ether); // Changed to `token` from `mockToken` to match declaration

        registry.createCall(
            address(token), // Changed to `token` from `mockToken` to match declaration
            10 ether,
            block.timestamp + 1 days,
            address(0),
            bytes32(0),
            "QmTest"
        );

        (address creator, address stakeToken, uint256 totalStakeYes, uint256 totalStakeNo,,,,,,,,) = registry.calls(0);

        assertEq(creator, user1);
        assertEq(stakeToken, address(token)); // Changed to `token` from `mockToken` to match declaration
        assertEq(totalStakeYes, 10 ether);
        assertEq(totalStakeNo, 0);

        // Check user stake
        assertEq(registry.userStakes(0, user1, true), 10 ether);
        vm.stopPrank();
    }

    function testStakeOnCall() public {
        // Create call first
        vm.startPrank(user1);
        token.approve(address(registry), 100 ether); // Changed to `token` from `mockToken` to match declaration
        registry.createCall(
            address(token), // Changed to `token` from `mockToken` to match declaration
            10 ether,
            block.timestamp + 1 days,
            address(0),
            bytes32(0),
            "QmTest"
        );
        vm.stopPrank();

        // User 2 stakes on NO (Challenge)
        vm.startPrank(user2);
        token.approve(address(registry), 100 ether); // Changed to `token` from `mockToken` to match declaration
        registry.stakeOnCall(0, 5 ether, false); // false = NO

        (,, uint256 totalStakeYes, uint256 totalStakeNo,,,,,,,,) = registry.calls(0);
        assertEq(totalStakeYes, 10 ether);
        assertEq(totalStakeNo, 5 ether);
        assertEq(registry.userStakes(0, user2, false), 5 ether);
        vm.stopPrank();

        // User 1 adds more stake on YES (Back)
        vm.startPrank(user1);
        registry.stakeOnCall(0, 2 ether, true); // true = YES
        (,, totalStakeYes, totalStakeNo,,,,,,,,) = registry.calls(0);
        assertEq(totalStakeYes, 12 ether);
        assertEq(registry.userStakes(0, user1, true), 12 ether);
        vm.stopPrank();
    }
}

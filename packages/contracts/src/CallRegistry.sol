// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CallRegistry is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Call {
        address creator;
        address stakeToken;
        uint256 totalStakeYes;
        uint256 totalStakeNo;
        uint256 startTs;
        uint256 endTs;
        address tokenAddress;
        bytes32 pairId;
        string ipfsCID;
        bool settled;
        bool outcome;
        uint256 finalPrice;
    }

    uint256 public nextCallId;
    mapping(uint256 => Call) public calls;
    // callId => user => position (true=YES, false=NO) => amount
    mapping(uint256 => mapping(address => mapping(bool => uint256))) public userStakes;

    event CallCreated(
        uint256 indexed callId,
        address indexed creator,
        address stakeToken,
        uint256 stakeAmount,
        uint256 startTs,
        uint256 endTs,
        address tokenAddress,
        bytes32 pairId,
        string ipfsCID
    );

    event StakeAdded(uint256 indexed callId, address indexed staker, bool position, uint256 amount);

    function createCall(
        address _stakeToken,
        uint256 _stakeAmount,
        uint256 _endTs,
        address _tokenAddress,
        bytes32 _pairId,
        string memory _ipfsCID
    ) external nonReentrant {
        require(_endTs > block.timestamp, "End time must be in future");
        require(_stakeAmount > 0, "Stake amount must be > 0");

        IERC20(_stakeToken).safeTransferFrom(msg.sender, address(this), _stakeAmount);

        uint256 callId = nextCallId++;
        calls[callId] = Call({
            creator: msg.sender,
            stakeToken: _stakeToken,
            totalStakeYes: _stakeAmount,
            totalStakeNo: 0,
            startTs: block.timestamp,
            endTs: _endTs,
            tokenAddress: _tokenAddress,
            pairId: _pairId,
            ipfsCID: _ipfsCID,
            settled: false,
            outcome: false,
            finalPrice: 0
        });

        // Creator always backs "YES" initially
        userStakes[callId][msg.sender][true] = _stakeAmount;

        emit CallCreated(
            callId, msg.sender, _stakeToken, _stakeAmount, block.timestamp, _endTs, _tokenAddress, _pairId, _ipfsCID
        );
    }

    function stakeOnCall(uint256 _callId, uint256 _amount, bool _position) external nonReentrant {
        Call storage call = calls[_callId];
        require(call.startTs > 0, "Call does not exist");
        require(block.timestamp < call.endTs, "Call ended");
        require(!call.settled, "Call settled");
        require(_amount > 0, "Amount must be > 0");

        IERC20(call.stakeToken).safeTransferFrom(msg.sender, address(this), _amount);

        if (_position) {
            call.totalStakeYes += _amount;
        } else {
            call.totalStakeNo += _amount;
        }

        userStakes[_callId][msg.sender][_position] += _amount;

        emit StakeAdded(_callId, msg.sender, _position, _amount);
    }
}

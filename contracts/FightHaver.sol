//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interface/IRegisterVerifier.sol";

contract FightHaver {
    IRegisterVerifier public immutable registerVerifier;

    // mapping of player address to the poseidon hash of their character/stats
    mapping(address => uint256) players;

    // EVENTS

    event PlayerRegistered(address player, uint256 playerHash);

    constructor(IRegisterVerifier _registerVerifier) {
        registerVerifier = _registerVerifier;
    }

    modifier requireRegisterProof(
        bytes calldata _zkProof,
        uint256 _playerHash
    ) {
        uint256[8] memory p = abi.decode(_zkProof, (uint256[8]));
        require(
            registerVerifier.verifyProof(
                [p[0], p[1]],
                [[p[2], p[3]], [p[4], p[5]]],
                [p[6], p[7]],
                [_playerHash]
            ),
            "zk:proof fail"
        );

        _;
    }

    function registerPlayer(
        bytes calldata _zkProof,
        uint256 _playerHash
    ) external requireRegisterProof(_zkProof, _playerHash) {
        // user can only have one character
        require(players[msg.sender] == uint256(0), "player already registered");
        players[msg.sender] = _playerHash;

        emit PlayerRegistered(msg.sender, _playerHash);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract PublicKeysProvider {
    string public name = "PublicKeysProvider";

    // certificates sign by this address are authentic
    address public certificatesAuthority;

    //certificates Authority name
    string public authorityName;

    // public keys
    mapping(address => string) public publicKeys;

    event AddKey(
        string publicKey
    );

    constructor(string memory _authorityName) {
        certificatesAuthority = msg.sender;
        authorityName = _authorityName;
    }

    function addKey(string memory _publicKey) public {
        // Make sure msg.sender exists
        require(msg.sender != address(0x0));

        // Make sure the public key exists
        require(bytes(_publicKey).length > 0);

        publicKeys[msg.sender] = _publicKey;

        emit AddKey(_publicKey);
    }
}

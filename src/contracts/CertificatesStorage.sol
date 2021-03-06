// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CertificatesStorage {
    string public name = "CertificatesStorage";

    //store certificates
    uint public certificatesCount = 0;
    mapping(uint => Certificate) public certificates;
    mapping(address => uint[]) public userCertificatesIDs;

    struct Certificate {
        uint id;
        address issuer;
        address owner;
        string ipfsHash;
        bool isAccepted;
    }

    event CertificateCreated (
        uint id,
        address issuer,
        address owner,
        string ipfsHash,
        bool isAccepted
    );

    event CertificateAccepted (
        uint id,
        address issuer,
        address owner,
        string ipfsHash,
        bool isAccepted
    );

    // Create certificate ( certificate awaits for acceptance by the owner )
    function createCertificate(address _owner, string memory _ipfsHash) public {
        // Make sure issuer address exists
        require(msg.sender != address(0x0));

        // Make sure owner address exists
        require(_owner != address(0x0));

        // Make sure the data hash exists
        require(bytes(_ipfsHash).length > 0);

        // Increment certificate id
        certificatesCount ++;

        // Add certificate to map
        certificates[certificatesCount] = Certificate(certificatesCount, msg.sender, _owner, _ipfsHash, false);

        // Add certificate id to userCertificatesIDs
        userCertificatesIDs[_owner].push(certificatesCount);

        // Trigger an event
        emit CertificateCreated(certificatesCount, msg.sender, _owner, _ipfsHash, false);
    }

    function getUserCertificatesIDs(address _userAddress) public view returns(uint[] memory){
        // Make sure user address exists
        require(_userAddress != address(0x0));

        return userCertificatesIDs[_userAddress];
    }

    function acceptCertificate(uint _id) public {
        // Make sure msg.sender exists
        require(msg.sender != address(0x0));

        // Make sure the _id is correct
        require(_id > 0 && _id <= certificatesCount);


        // Get proper certificate
        Certificate memory certificate = certificates[_id];

        // Only owner can accept certificate
        require(msg.sender == certificate.owner);

        // Changes certificate attributes
        certificate.isAccepted = true;

        // Update certificate
        certificates[_id] = certificate;

        // Trigger an event
        emit CertificateAccepted(_id, certificate.issuer, certificate.owner, certificate.ipfsHash, certificate.isAccepted);
    }

    function getCertificates() public view returns (Certificate[] memory){
        // Make sure msg.sender exists
        require(msg.sender != address(0x0));

        uint numberOfCertificates = userCertificatesIDs[msg.sender].length;
        Certificate[] memory userCertificates = new Certificate[](numberOfCertificates);

        // Getting proper certificates
        for (uint i = 0; i < numberOfCertificates; i++) {
            userCertificates[i] = certificates[userCertificatesIDs[msg.sender][i]];
        }

        return userCertificates;
    }
}

const CertificatesStorage = artifacts.require('./CertificatesStorage.sol')
const PublicKeysProvider = artifacts.require('./PublicKeysProvider.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('CertificatesStorage', ([issuer, owner]) => {
  let certificatesStorage

  before(async () => {
    certificatesStorage = await CertificatesStorage.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await certificatesStorage.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await certificatesStorage.name()
      assert.equal(name, 'CertificatesStorage')
    })
  })

  describe('create certificate', async () => {
    let result, certificatesCount
    const ipfsHash = '123456'
    const issuerSignature = '123abd456'

    before(async () => {
      result = await certificatesStorage.createCertificate(owner, ipfsHash, issuerSignature, {from: issuer})
      certificatesCount = await certificatesStorage.certificatesCount()
    })

    it('creates certificate', async () => {
      // SUCCESS
      assert.equal(certificatesCount, 1, 'certificatesCount is correct')
      const event = result.logs[0].args

      assert.equal(event.id.toNumber(), certificatesCount.toNumber(), 'id is correct')
      assert.equal(event.issuer, issuer, 'issuer address is correct')
      assert.equal(event.owner, owner, 'owner address is correct')
      assert.equal(event.ipfsHash, ipfsHash, 'ipfsHash amount is correct')
      assert.equal(event.issuerSignature, issuerSignature, 'signature is correct')
      assert.equal(event.isAccepted, false, 'isAccepted is correct')

      // FAILURE: Certificate must have owner
      await certificatesStorage.createCertificate(0x0, ipfsHash, issuerSignature, {from: issuer}).should.be.rejected;

      // FAILURE: Certificate must have ipfsHash
      await certificatesStorage.createCertificate(owner, '', issuerSignature, {from: issuer}).should.be.rejected;

      // FAILURE: Certificate must have issuer signature
      await certificatesStorage.createCertificate(ipfsHash, owner, '', {from: issuer}).should.be.rejected;
    })

    //check from certificates map
    it('lists certificates', async () => {
      const certificate = await certificatesStorage.certificates(certificatesCount)
      assert.equal(certificate.id.toNumber(), certificatesCount.toNumber(), 'id is correct')
      assert.equal(certificate.issuer, issuer, 'issuer address is correct')
      assert.equal(certificate.owner, owner, 'owner address is correct')
      assert.equal(certificate.ipfsHash, ipfsHash, 'ipfsHash amount is correct')
      assert.equal(certificate.issuerSignature, issuerSignature, 'signature is correct')
      assert.equal(certificate.isAccepted, false, 'isAccepted is correct')
    })
  })

  describe('accept certificate', async () => {
    let result, certificatesCount, userCertificatesIDs
    const ipfsHash = '7890'

    before(async () => {
      result = await certificatesStorage.acceptCertificate(1, ipfsHash, {from: owner})
      certificatesCount = await certificatesStorage.certificatesCount()
      userCertificatesIDs = await certificatesStorage.userCertificatesIDs(owner, 0)
    })

    it('should accept certificate', async () => {
      // SUCCESS
      assert.equal(certificatesCount, 1, 'certificatesCount is correct')
      assert.equal(userCertificatesIDs, 1, 'userCertificatesIDs is correct')
      const event = result.logs[0].args

      assert.equal(event.id.toNumber(), certificatesCount.toNumber(), 'id is correct')
      assert.equal(event.issuer, issuer, 'issuer address is correct')
      assert.equal(event.owner, owner, 'owner address is correct')
      assert.equal(event.ipfsHash, ipfsHash, 'ipfsHash amount is correct')
      assert.equal(event.issuerSignature, '123abd456', 'signature is correct')
      assert.equal(event.isAccepted, true, 'isAccepted is correct')

      // FAILURE: Passed id must be correct
      await certificatesStorage.acceptCertificate(0, ipfsHash, {from: owner}).should.be.rejected;

      // FAILURE: Passed ipfs must exist
      await certificatesStorage.acceptCertificate(1, '', {from: owner}).should.be.rejected;

      // FAILURE: Only owner can accept certificate
      await certificatesStorage.acceptCertificate(1, ipfsHash, {from: issuer}).should.be.rejected;
    });

    //check from certificates map
    it('should update contract', async () => {
      const certificate = await certificatesStorage.certificates(certificatesCount)
      assert.equal(certificate.id.toNumber(), certificatesCount.toNumber(), 'id is correct')
      assert.equal(certificate.issuer, issuer, 'issuer address is correct')
      assert.equal(certificate.owner, owner, 'owner address is correct')
      assert.equal(certificate.ipfsHash, ipfsHash, 'ipfsHash amount is correct')
      assert.equal(certificate.issuerSignature, '123abd456', 'signature is correct')
      assert.equal(certificate.isAccepted, true, 'isAccepted is correct')
    })
  })
})

contract('PublicKeysProvider', ([address]) => {
  let publicKeysProvider

  before(async () => {
    publicKeysProvider = await PublicKeysProvider.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await publicKeysProvider.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await publicKeysProvider.name()
      assert.equal(name, 'PublicKeysProvider')
    })
  })

  describe('add key', async () => {
    let result
    const publicKey = '123456'

    before(async () => {
      result = await publicKeysProvider.addKey(publicKey, {from: address})
    })

    it('creates certificate', async () => {
      // SUCCESS
      const event = result.logs[0].args

      assert.equal(event.publicKey, publicKey, 'key is correct')

      // FAILURE: Empty string passed
      await publicKeysProvider.addKey('', {from: address}).should.be.rejected;
    })

    //check from certificates map
    it('lists certificates', async () => {
      const key = await publicKeysProvider.publicKeys(address)
      assert.equal(key, publicKey, 'key is correct')
    })
  })
})
const CertificatesStorage = artifacts.require("CertificatesStorage");
const PublicKeysProvider = artifacts.require("PublicKeysProvider");

module.exports = function (deployer) {
  deployer.deploy(CertificatesStorage);
  deployer.deploy(PublicKeysProvider, "Government");
};

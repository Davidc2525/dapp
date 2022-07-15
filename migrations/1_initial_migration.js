const Migrations = artifacts.require("Migrations");
const ContratoA = artifacts.require("ContratoA");

const Bingo = artifacts.require("Bingo");

module.exports = function (deployer) {
  deployer.deploy(Migrations).then(function(){
    deployer.deploy(ContratoA)
  });
};

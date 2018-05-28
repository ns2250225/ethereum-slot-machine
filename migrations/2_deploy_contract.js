var SlotMachine = artifacts.require("./slotMachine.sol");

module.exports = function(deployer) {
  deployer.deploy(SlotMachine);
};
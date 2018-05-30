var SlotMachine = artifacts.require('./SlotMachine');

module.exports = (deployer) => {
    deployer.deploy(SlotMachine);
}
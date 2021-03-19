
const IssueERC20 = artifacts.require('./contracts/IssueERC20.sol')
module.exports = function(deployer) {
  return deployer.then(() => {
    return deployContracts(deployer)
  })
}


async function deployContracts(deployer) {

  // deploy contract
  await deployer.deploy(IssueERC20,"helloeorld")

  console.log("IssueERC20 Contract Address ======================>", IssueERC20.address)
  console.log("IssueERC20 Contract name ======================>", IssueERC20.address._name)
}
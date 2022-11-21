const { network } = require("hardhat") // not necessary, javascript can infer
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER
} = require("../helper-hardhat.config")

module.exports = async hre => {
  const { getNamedAccounts, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  if (developmentChains.includes(network.name)) {
    log("Local network. Deploying mocks.")
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER]
    })
    log("Mocks deployed successfully.")
    log("------------------------------------------------")
  }
}

module.exports.tags = ["all", "mocks"]

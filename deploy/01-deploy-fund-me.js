const { networkConfig, developmentChains } = require("../helper-hardhat.config")
const { network } = require("hardhat") // not necessary, javascript can infer

module.exports = async hre => {
  const { getNamedAccounts, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  let ethUsdPriceFeedAddress

  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeedAddress
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true
  })
  log("Deployment done for Fund Me!")
  log("----------------------------------------------")
}

module.exports.tags = ["all", "fundme"]

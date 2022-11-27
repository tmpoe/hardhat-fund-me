const { networkConfig, developmentChains } = require("../helper-hardhat.config")
const { network } = require("hardhat") // not necessary, javascript can infer
const { verify } = require("../utils/verify")

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
  const args = [ethUsdPriceFeedAddress]
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    verify(fundMe.address, args)
  }

  log("Deployment done for Fund Me!")
  log("----------------------------------------------")
}

module.exports.tags = ["all", "fundme"]

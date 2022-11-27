const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const constants = require("@openzeppelin/test-helpers")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat.config.js")
const { assertion } = require("@openzeppelin/test-helpers/src/expectRevert.js")

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe
      let deployer
      const sendValue = ethers.utils.parseEther("0.1")
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it("allows to withdraw funds", async () => {
        const fundTxResponse = await fundMe.fund({ value: sendValue })
        fundTxResponse.wait(1)

        const withdrawTxResponse = await fundMe.withdraw()
        withdrawTxResponse.wait(1)

        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        assert.equal(endingBalance.toString(), "0")
      })
    })

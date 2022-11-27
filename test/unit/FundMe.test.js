const { deployments, ethers, getNamedAccounts } = require("hardhat")
const constants = require("@openzeppelin/test-helpers")
const { assert, expect } = require("chai")

describe("FundMe", async () => {
  let fundMe
  let deployer
  let mockV3Aggregator
  const sendValue = ethers.utils.parseEther("1")
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer
    await deployments.fixture(["all"])
    fundMe = await ethers.getContract("FundMe", deployer)
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
  })

  describe("constructor", async () => {
    it("sets the aggregator correctly", async () => {
      const response = await fundMe.getPriceFeed()
      assert.equal(response, mockV3Aggregator.address)
    })
  })

  describe("fund", async () => {
    it("fails if you don't send enough eth", async () => {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      )
    })

    it("correctly updates the funds sent", async () => {
      await fundMe.fund({ value: sendValue })

      const savedValue = await fundMe.getAddressToAmountFunded(deployer)

      assert.equal(savedValue.toString(), sendValue.toString())
    })

    it("adds funder to array of funders", async () => {
      await fundMe.fund({ value: sendValue })

      const funder = await fundMe.getFunder(0)
      assert.equal(funder, deployer)
    })
  })
  describe("withdraw", async () => {
    let startingDeployerBalance
    let startingFundMeBalance
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue })
      const savedValue = await fundMe.getAddressToAmountFunded(deployer)
      const funder = await fundMe.getFunder(0)

      assert.notEqual(savedValue, 0)
      assert.notEqual(funder, constants.ZERO_ADDRESS)

      startingDeployerBalance = await fundMe.provider.getBalance(deployer)
      startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)

      assert.notEqual(startingFundMeBalance, 0)
    })

    it("withdraws money from a single funder", async () => {
      const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait(1)
      const { gasUsed, effectiveGasPrice } = transactionReceipt
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )

      assert.equal(
        endingDeployerBalance.add(gasCost).toString(),
        startingFundMeBalance.add(startingDeployerBalance).toString()
      )
      assert.equal(endingFundMeBalance, 0)
    })

    it("withdraws money from multiple funders", async () => {
      const numberOfFunders = 5
      const accounts = await ethers.getSigners()
      for (let i = 1; i < numberOfFunders + 1; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i])
        fundMeConnectedContract.fund({ value: sendValue })
      }

      startingDeployerBalance = await fundMe.provider.getBalance(deployer)
      startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)

      const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait(1)
      const { gasUsed, effectiveGasPrice } = transactionReceipt
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )

      assert.equal(
        endingDeployerBalance.add(gasCost).toString(),
        startingFundMeBalance.add(startingDeployerBalance).toString()
      )
      assert.equal(endingFundMeBalance, 0)

      await expect(fundMe.getFunder(0)).to.be.reverted

      for (let i = 1; i < numberOfFunders + 1; i++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[i].address),
          0
        )
      }
    })

    it("only allows owner to withdraw", async () => {
      const accounts = await ethers.getSigners()
      const fundMeConnectedContract = await fundMe.connect(accounts[1])
      await expect(
        fundMeConnectedContract.withdraw()
      ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
    })
  })
})

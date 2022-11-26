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
      const response = await fundMe.priceFeed()
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

      const savedValue = await fundMe.addressToAmountFunded(deployer)
      console.log("piripocs2")

      assert.equal(savedValue.toString(), sendValue.toString())
    })

    it("adds funder to array of funders", async () => {
      await fundMe.fund({ value: sendValue })

      const funder = await fundMe.funders(0)
      assert.equal(funder, deployer)
    })
  })
  describe("withdraw", async () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue })
      const savedValue = await fundMe.addressToAmountFunded(deployer)
      const funder = await fundMe.funders(0)

      assert.notEqual(sendValue.toString(), "0")
      assert.notEqual(funder, constants.ZERO_ADDRESS)
    })

    it("withdraws money from a single funder", async () => {
      assert(true)
    })
  })
})
import { expect } from "chai";
import { ethers } from "hardhat";
import { IDGAFBridge, IDGAFTokenL2, IDGAFChainBridge } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("IDGAF Bridge System", function () {
  let idgafBridgeL1: IDGAFBridge;
  let idgafTokenL2: IDGAFTokenL2;
  let idgafChainBridge: IDGAFChainBridge;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let operator: SignerWithAddress;

  // Mock IDGAF token address (L1)
  const IDGAF_TOKEN_L1 = "0x87deEb3696Ec069d5460C389cc78925df50d7777";

  beforeEach(async function () {
    [owner, user, operator] = await ethers.getSigners();

    // Deploy L2 Token
    const IDGAFTokenL2Factory = await ethers.getContractFactory("IDGAFTokenL2");
    idgafTokenL2 = await IDGAFTokenL2Factory.deploy(owner.address);
    await idgafTokenL2.waitForDeployment();

    // Deploy L2 Bridge
    const IDGAFChainBridgeFactory = await ethers.getContractFactory("IDGAFChainBridge");
    idgafChainBridge = await IDGAFChainBridgeFactory.deploy(
      await idgafTokenL2.getAddress(),
      owner.address
    );
    await idgafChainBridge.waitForDeployment();

    // Set bridge in token
    await idgafTokenL2.setBridge(await idgafChainBridge.getAddress());

    // Deploy L1 Bridge
    const IDGAFBridgeFactory = await ethers.getContractFactory("IDGAFBridge");
    idgafBridgeL1 = await IDGAFBridgeFactory.deploy(owner.address);
    await idgafBridgeL1.waitForDeployment();

    // Set Monad bridge in L2 bridge
    await idgafChainBridge.setMonadBridge(await idgafBridgeL1.getAddress());
  });

  describe("Deployment", function () {
    it("Should deploy all contracts correctly", async function () {
      expect(await idgafTokenL2.getAddress()).to.be.properAddress;
      expect(await idgafChainBridge.getAddress()).to.be.properAddress;
      expect(await idgafBridgeL1.getAddress()).to.be.properAddress;
    });

    it("Should set bridge in token correctly", async function () {
      const bridge = await idgafTokenL2.bridge();
      expect(bridge).to.equal(await idgafChainBridge.getAddress());
    });

    it("Should set Monad bridge in L2 bridge correctly", async function () {
      const monadBridge = await idgafChainBridge.monadBridge();
      expect(monadBridge).to.equal(await idgafBridgeL1.getAddress());
    });
  });

  describe("L2 Token Operations", function () {
    it("Should mint tokens when deposit is processed", async function () {
      const amount = ethers.parseEther("100");
      const depositId = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "uint256"],
          [user.address, amount, 1]
        )
      );

      await idgafChainBridge.connect(owner).processDeposit(user.address, amount, depositId);

      expect(await idgafTokenL2.balanceOf(user.address)).to.equal(amount);
    });

    it("Should burn tokens when withdrawal is initiated", async function () {
      const amount = ethers.parseEther("100");
      const depositId = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "uint256"],
          [user.address, amount, 1]
        )
      );

      // First deposit
      await idgafChainBridge.connect(owner).processDeposit(user.address, amount, depositId);
      expect(await idgafTokenL2.balanceOf(user.address)).to.equal(amount);

      // Then withdraw
      await idgafChainBridge.connect(user).initiateWithdrawal(amount);
      expect(await idgafTokenL2.balanceOf(user.address)).to.equal(0);
    });

    it("Should not allow minting from non-bridge address", async function () {
      const amount = ethers.parseEther("100");
      await expect(
        idgafTokenL2.connect(user).mint(user.address, amount)
      ).to.be.revertedWith("IDGAFTokenL2: only bridge can call");
    });

    it("Should not allow burning from non-bridge address", async function () {
      const amount = ethers.parseEther("100");
      await expect(
        idgafTokenL2.connect(user).burn(user.address, amount)
      ).to.be.revertedWith("IDGAFTokenL2: only bridge can call");
    });
  });

  describe("Bridge Operations", function () {
    it("Should process deposit only once", async function () {
      const amount = ethers.parseEther("100");
      const depositId = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "uint256"],
          [user.address, amount, 1]
        )
      );

      await idgafChainBridge.connect(owner).processDeposit(user.address, amount, depositId);
      
      await expect(
        idgafChainBridge.connect(owner).processDeposit(user.address, amount, depositId)
      ).to.be.revertedWith("IDGAFChainBridge: deposit already processed");
    });

    it("Should not allow non-owner to process deposits", async function () {
      const amount = ethers.parseEther("100");
      const depositId = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "uint256"],
          [user.address, amount, 1]
        )
      );

      await expect(
        idgafChainBridge.connect(user).processDeposit(user.address, amount, depositId)
      ).to.be.revertedWithCustomError(idgafChainBridge, "OwnableUnauthorizedAccount");
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to set bridge operators", async function () {
      await idgafBridgeL1.connect(owner).setBridgeOperator(operator.address, true);
      expect(await idgafBridgeL1.bridgeOperators(operator.address)).to.be.true;
    });

    it("Should not allow non-owner to set bridge operators", async function () {
      await expect(
        idgafBridgeL1.connect(user).setBridgeOperator(operator.address, true)
      ).to.be.revertedWithCustomError(idgafBridgeL1, "OwnableUnauthorizedAccount");
    });
  });
});


import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Verifier } from "../typechain";
import { registerProof } from "./utils/proof";

const playerOneInfo = {
  stats: [100, 100, 100, 100, 100, 500],
  nonce: 1234,
};

const emptyProof =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

describe("FightHaver", () => {
  it("throws with invalid proof", async () => {
    const [player1] = await ethers.getSigners();

    const RegisterVerifierFactory = await ethers.getContractFactory(
      "contracts/registerVerifier.sol:Verifier"
    );

    const registerVerifier = await RegisterVerifierFactory.deploy();
    await registerVerifier.deployed();

    const FightHaverFactory = await ethers.getContractFactory("FightHaver");
    const fightHaver = await FightHaverFactory.deploy(registerVerifier.address);
    await fightHaver.deployed();

    const proof = await registerProof(playerOneInfo);
    await expect(
      fightHaver.connect(player1).registerPlayer(emptyProof, proof.inputs[0])
    ).to.be.reverted;
  });

  it("can register a player with a valid zk proof", async () => {
    const [player1] = await ethers.getSigners();

    const RegisterVerifierFactory = await ethers.getContractFactory(
      "contracts/registerVerifier.sol:Verifier"
    );

    const registerVerifier = await RegisterVerifierFactory.deploy();
    await registerVerifier.deployed();

    const FightHaverFactory = await ethers.getContractFactory("FightHaver");
    const fightHaver = await FightHaverFactory.deploy(registerVerifier.address);
    await fightHaver.deployed();

    const proof = await registerProof(playerOneInfo);
    await expect(
      fightHaver
        .connect(player1)
        .registerPlayer(proof.solidityProof, proof.inputs[0])
    )
      .to.emit(fightHaver, "PlayerRegistered")
      .withArgs(player1.address, proof.inputs[0]);
  });
});

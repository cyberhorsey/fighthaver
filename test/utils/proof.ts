const snarkjs = require("snarkjs");
const fs = require("fs");
const bigInt = require("big-integer");

const registerWC = require("../../circom/register/register_js/witness_calculator.js");
const registerWasm = "./circom/register/register_js/register.wasm";
const registerZkey = "./circom/register/register_0001.zkey";
const WITNESS_FILE = "/tmp/witness";

const registerProof = async (input: any) => {
  const buffer = fs.readFileSync(registerWasm);
  const witnessCalculator = await registerWC(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(input);
  // The package methods read from files only, so we just shove it in /tmp/ and hope
  // there is no parallel execution.
  fs.writeFileSync(WITNESS_FILE, buff);
  const { proof, publicSignals } = await snarkjs.groth16.prove(
    registerZkey,
    WITNESS_FILE
  );
  const solidityProof = proofToSolidityInput(proof);
  return {
    solidityProof: solidityProof,
    inputs: publicSignals,
  };
};

// Instead of passing in a large array of numbers (annoying), we
// just make proof a single string (which will be decompiled as a uint32
// in the contract)
// Copied from Tornado's websnark fork:
// https://github.com/tornadocash/websnark/blob/master/src/utils.js
const proofToSolidityInput = (proof: any): string => {
  const proofs: string[] = [
    proof.pi_a[0],
    proof.pi_a[1],
    proof.pi_b[0][1],
    proof.pi_b[0][0],
    proof.pi_b[1][1],
    proof.pi_b[1][0],
    proof.pi_c[0],
    proof.pi_c[1],
  ];
  const flatProofs = proofs.map((p) => bigInt(p));
  return "0x" + flatProofs.map((x) => toHex32(x)).join("");
};

const toHex32 = (num: number) => {
  let str = num.toString(16);
  while (str.length < 64) str = "0" + str;
  return str;
};

export { registerProof, proofToSolidityInput };

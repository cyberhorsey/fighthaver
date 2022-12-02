circom circuits/register.circom --wasm
node register_js/generate_witness.js register_js/create.wasm input/register_input.json witness.wtns
snarkjs wtns export json
cat witness.json
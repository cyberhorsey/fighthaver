pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "./consts.circom";

template FightHaverRegister() {

    var statsLength = getStatsLength();

    // prevents hash from being globally unique
    signal input nonce;
    // stats for your player.
    // takes the format of array of numbers, must
    // equal total stats of 100.
    // stats[0] = attack
    // stats[1] = defense
    // stats[2] = magic
    // stats[3] = magic defense
    // stats[4] = speed
    // stats[5] = health
    signal input stats[statsLength];
    
    // public output hash of your character.
    signal output out;

    var maxStatsTotal = getMaxStatsTotal();

    // verify the sum of the stat total is < maxStatsTotal
    var total = 0;

    for (var i = 0;i<statsLength;i++) {
        total += stats[i];
    }

    assert(total <= maxStatsTotal);

    component poseidon = Poseidon(7);
    // add nonce to poseidon hash to it's unique per stats
    poseidon.inputs[0] <== nonce;
    for(var i = 0; i < statsLength;i++) {
        poseidon.inputs[i+1] <== stats[i] * (10 ** 1);
    }

    out <-- poseidon.out;
}

component main = FightHaverRegister();
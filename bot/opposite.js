const ethers = require('ethers');
const Web3 = require("web3");
const web3 = new Web3("http://127.0.0.1:27545");
let websocketURL = "ws://127.0.0.1:27546";

const config = require("../config/bot.json");
const whaleConfig = require('../config/whale.json');
const secret = require('../config/addr/pk.json');
const predictionAbi = require('../config/abis/predictionAbi.json');

const predictContract = new web3.eth.Contract(predictionAbi, config._router);
const provider = new ethers.providers.WebSocketProvider(websocketURL);
const wallet = new ethers.Wallet(secret._p_key, provider);
const p_contract = new ethers.Contract(config._router, predictionAbi, provider);
const predContract = new ethers.Contract(config._router, predictionAbi, wallet);

let current_epoch = 0
let bet_amount = 0.15
const chin_value = 4

console.log("Starting Opposite Bot...");

bet_func()
async function bet_func() {
    current_epoch = await predContract.currentEpoch() - 1;
}

p_contract.on("BetBull", async (sender, epoch, amount) => {
    if (Number(ethers.utils.formatEther(amount)) >= chin_value) {
        betToEpoch1(current_epoch + 1, false, wallet.address, wallet.privateKey, bet_amount.toFixed(3), whaleConfig._gas_price, whaleConfig._gas_limit)
    }
})

p_contract.on("BetBear", async (sender, epoch, amount) => {
    if (Number(ethers.utils.formatEther(amount)) >= chin_value) {
        betToEpoch1(current_epoch + 1, true, wallet.address, wallet.privateKey, bet_amount.toFixed(3), whaleConfig._gas_price, whaleConfig._gas_limit)
    }
})

p_contract.on("StartRound", async (epoch) => {
    current_epoch = epoch.toNumber() - 1;
})

async function betToEpoch1(epoch, isBull, wallet, privateKey, amount, gasfee, gaslimit) {
    try {
        var data;
        if (isBull == true)
            data = predictContract.methods.betBull(epoch).encodeABI();
        else
            data = predictContract.methods.betBear(epoch).encodeABI();
        var rawTransaction = {
            from: wallet,
            to: config._router,
            value: amount * 10 ** 18,
            gas: gaslimit,
            gasPrice: gasfee,
            data: data,
        };
        var signedTx = await web3.eth.accounts.signTransaction(
            rawTransaction,
            privateKey
        );
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    } catch (err) {console.log(err) }
}

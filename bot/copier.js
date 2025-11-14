const ethers = require('ethers');
const Web3 = require('web3');
const web3 = new Web3("http://127.0.0.1:27545");
let websocketURL = "ws://127.0.0.1:27546";

const configs = require("../config/bot.json");
const copierConfigs = require('../config/copier.json');
const secret = require('../config/addr/pk.json');
const predictionAbi = require('../config/abis/predictionAbi.json');

const predictContract = new web3.eth.Contract(predictionAbi, configs._router);
const provider = new ethers.providers.WebSocketProvider(websocketURL);
const wallet = new ethers.Wallet(secret._p_key, provider);
const p_contract = new ethers.Contract(configs._router, predictionAbi, provider);
const predContract = new ethers.Contract(configs._router, predictionAbi, wallet);

let current_epoch = 0
let bet_amount = copierConfigs._max_bet_amount
const target = copierConfigs._target
let bet_flag = false;

console.log("Starting Copier BOT...");

setCurrentEpoch()
async function setCurrentEpoch() {
    current_epoch = await predContract.currentEpoch() - 1;
}

p_contract.on("StartRound", async (epoch) => {
    bet_flag = true
    current_epoch = epoch.toNumber() - 1;
    const claim_result = await predContract.claimable(current_epoch - 1, wallet.address);
    if (claim_result) {
        try {
            const tx_res = await predContract.claim([current_epoch - 1], {
            })
            bet_res = await tx_res.wait(1)
        } catch (e) { }
    }
})

provider.on('pending', (tx) => {
    provider.getTransaction(tx).then(async transaction => {
        if (transaction != null && target.includes(transaction.from.toLowerCase()) && transaction.to == copierConfigs._router && parseInt(transaction.data.substring(69), 16) == current_epoch + 1) {
            bet_amount = Number(ethers.utils.formatEther(transaction.value)) * copierConfigs._percentage / 100
            if (bet_amount > copierConfigs._max_bet_amount) {
                bet_amount = copierConfigs._max_bet_amount
            }
            if (transaction.data.includes("0xaa6b873a")) { // bet to bear
                betToEpoch1(current_epoch + 1, false, wallet.address, wallet.privateKey, bet_amount.toFixed(4), copierConfigs._gas_price, copierConfigs._gas_limit)
            } else if (transaction.data.includes("0x57fb096f")) { // bet to bull
                betToEpoch1(current_epoch + 1, true, wallet.address, wallet.privateKey, bet_amount.toFixed(4), copierConfigs._gas_price, copierConfigs._gas_limit)
            }
        }
    })
});

p_contract.on("BetBear", async (sender, epoch, amount, event) => {
    const formattedAmount = Number(ethers.utils.formatEther(amount)).toFixed(4);
    if (parseInt(epoch) === current_epoch + 1 && target.includes(sender.toLowerCase())) {
        let bet_amount = formattedAmount * copierConfigs._percentage / 100;
        if (bet_amount > copierConfigs._max_bet_amount) {
            bet_amount = copierConfigs._max_bet_amount;
        }

        await betToEpoch1(
            current_epoch + 1,
            false,
            wallet.address,
            wallet.privateKey,
            bet_amount.toFixed(4),
            copierConfigs._gas_price,
            copierConfigs._gas_limit
        );
    }
});


p_contract.on("BetBull", async (sender, epoch, amount, event) => {
    const formattedAmount = Number(ethers.utils.formatEther(amount)).toFixed(4);
    if (parseInt(epoch) === current_epoch + 1 && target.includes(sender.toLowerCase())) {
        let bet_amount = formattedAmount * copierConfigs._percentage / 100;
        if (bet_amount > copierConfigs._max_bet_amount) {
            bet_amount = copierConfigs._max_bet_amount;
        }

        await betToEpoch1(
            current_epoch + 1,
            true,
            wallet.address,
            wallet.privateKey,
            bet_amount.toFixed(4),
            copierConfigs._gas_price,
            copierConfigs._gas_limit
        );
    }
});

async function betToEpoch1(epoch, isBull, wallet, privateKey, amount, gasfee, gaslimit) {
    if (bet_flag) {
        try {
            var data;
            if (isBull == true)
                data = predictContract.methods.betBull(epoch).encodeABI();
            else
                data = predictContract.methods.betBear(epoch).encodeABI();
            var rawTransaction = {
                from: wallet,
                to: configs._router,
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
            bet_flag = false;
            console.log("\x1b[34m%s\x1b[0m", `Copied Success ===> ${wallet} | ${amount} BNB`);
        } catch (err) {
            console.error("Error while processing the bet : ", err);
        }
    }
}

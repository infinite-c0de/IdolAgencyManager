const axios = require('axios');
const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3("http://127.0.0.1:27545");

const configs = require('../config/bot.json');
const predictABI = require('../config/abis/predictionAbi.json');
const predictContract = new web3.eth.Contract(predictABI, configs._router);
const pa = require('../config/addr/public.json')

var init = function () {
    getLastBetting();
    const ourWallet = pa._bot_addr
    var globalEpoch = 0, leftTime = 0
    async function getLastBetting() {
        const currentEpoch = await predictContract.methods.currentEpoch().call();
        const roundInfo = await predictContract.methods.rounds(currentEpoch - 1).call();

        var closeTime = roundInfo.closeTimestamp;
        const currentTime = Date.now() / 1000;
        leftTime = closeTime - currentTime;
        leftTime = leftTime.toFixed(0);
        if (globalEpoch != currentEpoch) {
            globalEpoch = currentEpoch;
            checked = 0;
        }
        if (leftTime <= 300 && checked == 0) {
            checked = 1;
            let bullAmount = 0, bearAmount = 0;
            var bullBets = [], bearBets = [];
            const length = await predictContract.methods.getUserRoundsLength(ourWallet).call();
            if (length > 0) {
                const lastRound = await predictContract.methods.getUserRounds(ourWallet, length - 1, 1).call();
                const amount = parseFloat(lastRound[1][0].amount) / 10 ** 18;
                if (lastRound[0][0] == (currentEpoch - 1) && amount > 0.001) {
                    var method = "Bull";
                    if (lastRound[1][0].position == 1) {
                        method = "Bear";
                        bearAmount += amount;
                        bearBets.push(ourWallet);
                    }
                    else {
                        bullAmount += amount;
                        bullBets.push(ourWallet);
                    }
                }
            }
            let bullPayout = roundInfo.totalAmount / roundInfo.bullAmount;
            let bearPayout = roundInfo.totalAmount / roundInfo.bearAmount;
            var bull_message_own = "Success BullBet " + bullAmount.toFixed(3) + "BNB " + (currentEpoch - 1) + "\n" + "(" + bullBets + ") " + (bullAmount * bullPayout * 0.97).toFixed(3) + "BNB"
            var bear_message_own = "Success BearBet " + bearAmount.toFixed(3) + "BNB " + (currentEpoch - 1) + "\n" + "(" + bearBets + ") " + (bearAmount * bearPayout * 0.97).toFixed(3) + "BNB"
            if (bullAmount > 0.001) {
                sendMessage(bull_message_own, configs.our_bets);
            }
            if (bearAmount > 0.001) {
                sendMessage(bear_message_own, configs.our_bets);
            }
        }
        setTimeout(getLastBetting, 5000);
    }

    var idotWallets = {};
    getIdotwallets();
    async function getIdotwallets() {
        try {
            fs.readFile("./data/idot.txt", 'utf8', async function (err, data) {
                if (err) throw err;
                let array = data.toString().split(/\r?\n/)
                for (i in array) {
                    let idot_address = array[i].toString().toLowerCase();
                    if (idot_address != '') {
                        let idot_balance = await web3.eth.getBalance(idot_address)
                        idot_balance = idot_balance / 10 ** 18
                        if (idotWallets[idot_address] != idot_balance.toFixed(4)) {
                            var idot_msg = "<https://bscscan.com/address/" + idot_address +">" + " balance updated to " + idot_balance.toFixed(4) + " BNB"
                            sendMessage(idot_msg, configs.idot_tracker)
                            idotWallets[idot_address] = idot_balance.toFixed(4)
                        }
                    }
                }
            });
        } catch (error) {
            console.log(error);
        }
        setTimeout(getIdotwallets, 5000);
    }
};

init();

async function sendMessage(message, webHook) {
    try {
        const data = { content: message };
        await axios.post(webHook, data);
    } catch (err) { }
}

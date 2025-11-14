const axios = require('axios');
const ethers = require('ethers');
var fs = require('fs')
let websocketURL = "ws://127.0.0.1:27546";

const config = require("../config/bot.json");
const whaleConfig = require('../config/whale.json');
const secret = require('../config/addr/pk.json');
const predictionAbi = require('../config/abis/predictionAbi.json');
const profileAbi = require('../config/abis/pancakeProfileAbi.json');

const provider = new ethers.providers.WebSocketProvider(websocketURL);
const wallet = new ethers.Wallet(secret._p_key, provider);
const p_contract = new ethers.Contract(config._router, predictionAbi, provider);
const profile_contract = new ethers.Contract(config._profile_contract_Address, profileAbi, provider);
const predContract = new ethers.Contract(config._router, predictionAbi, wallet);
const predictContract = new web3.eth.Contract(predictionAbi, config._router);

const botAddr = wallet.address.toLowerCase().toString(); // bot public address
const allBettingAddrs = []; // all betting addresses
let bearTotalBettingAmount = 0; // bear total betting amount
let bullTotalBettingAmount = 0; // bull total betting amount

const fixedBettingAmount = []; // manual betting amount


let bet_status = []
let bull_amount = 0
let bear_amount = 0
let bull_users = 0
let bear_users = 0
let current_epoch = 0
let cal_flag = true
let double_flag = true
let closeTime = 0
const targetBettingAddrs = [] // target betting addresses
let targetAddrs = whaleConfig._target // target addresses
const copierAddresses = [] // 21000 copier addresses
let leftTime

const red = '\x1b[31m';
const green = '\x1b[32m';
const blue = '\x1b[34m';
const yellow = '\x1b[1;33m%s\x1b[0m';
const cyan = '\x1b[36m';
const resetColor = '\x1b[0m';

read_target()
async function read_target() {
    fs.readFile("./data/target.txt", 'utf8', function (err, data) {
        if (err) throw err;
        let array = data.toString().split(/\r?\n/)
        for (i in array) {
            if (!targetAddrs.includes(array[i].toString()))
                targetAddrs.push(array[i].toString())
        }
        fs.readFile("./data/copier_211000.txt", 'utf8', function (err, data) {
            if (err) throw err;
            let array = data.toString().split(/\r?\n/)
            for (i in array) {
                if (!copierAddresses.includes(array[i].toString()))
                    copierAddresses.push(array[i].toString())
            }
        });
        fs.readFile("./data/bet_status.txt", 'utf8', function (err, data) {
            if (err) throw err;
            bet_status = data.toString().split(/\r?\n/)
            console.log("Starting Bot...");
            bet_func()
        });
        fs.readFile("./data/amount.txt", "utf8", function (err, data) {
            if (err) throw err;
            let array = data.toString().split(/\r?\n/);
            for (i in array) {
                if (!fixedBettingAmount.includes(array[i].toString()))
                    fixedBettingAmount.push(array[i].toString());
            }
        });
    });
}

async function bet_func() {
    if (!double_flag) {
        return setTimeout(bet_func, 5);
    }
    try {
        if (cal_flag) {
            current_epoch = await predContract.currentEpoch() - 1;
            const round_result = await predContract.rounds(current_epoch);
            closeTime = round_result.closeTimestamp;
            cal_flag = false
        }
        const currentTime = Date.now() / 1000;
        leftTime = parseFloat((closeTime - currentTime).toFixed(4));

        if (leftTime < whaleConfig._bet_time + 5) {
            fs.readFile("./data/bet_status.txt", 'utf8', function (err, data) {
                if (err) throw err;
                bet_status = data.trim().split(/\r?\n/);
            });
        }

        if (leftTime < whaleConfig._bet_time + 3) {
            console.log(`Left time is ${cyan}${leftTime}s${resetColor} and Next round is ${cyan}${current_epoch + 1}${resetColor}`);
            console.log(`Bull Total Amount :  ${cyan}${bullTotalBettingAmount.toFixed(3)}${resetColor}  |  Bear Total :  ${cyan}${bearTotalBettingAmount.toFixed(3)}${resetColor}`);
            console.log(`Bull Payout : ${cyan}${((bearTotalBettingAmount + bullTotalBettingAmount) / bullTotalBettingAmount).toFixed(2)}${resetColor}  |  Bear Payout : ${cyan}${((bearTotalBettingAmount + bullTotalBettingAmount) / bearTotalBettingAmount).toFixed(2)}${resetColor}`);
            if (bet_status[0] == "fixedBear") {
                betToEpoch1(current_epoch + 1, false, wallet.address, wallet.privateKey, parseFloat(fixedBettingAmount[0]).toFixed(4), whaleConfig._gas_price, whaleConfig._gas_limit);
                current_bet_status = 0;
            } else if (bet_status[0] == "fixedBull") {
                betToEpoch1(current_epoch + 1, true, wallet.address, wallet.privateKey, parseFloat(fixedBettingAmount[0]).toFixed(4), whaleConfig._gas_price, whaleConfig._gas_limit);
                current_bet_status = 0;
            }
        }

        if (leftTime < whaleConfig._bet_time) {
            double_flag = false
            console.log(`Left time is ${cyan}${leftTime}s${resetColor} and Next round is ${cyan}${current_epoch + 1}${resetColor}`);
            console.log(`Bet Bull Users  : ${cyan}${bull_users}${resetColor}     |  Bet Bear Users  : ${cyan}${bear_users}${resetColor}`);
            console.log(`Bet Bull Amount : ${cyan}${bull_amount.toFixed(3)}${resetColor} |  Bet Bear Amount : ${cyan}${bear_amount.toFixed(3)}${resetColor}`);

            if (bull_amount > whaleConfig._chin_value || bear_amount > whaleConfig._chin_value) {
                sendMessageforChannel("Seems whale is playing now : " + (current_epoch + 1), config.whale_appear)
            }

            const diff = bull_amount - bear_amount;
            let current_bet_status = 0
            let bet_amount = 0

            if (diff > whaleConfig._chin_value) {
                current_bet_status = 1;
                bet_amount = diff * whaleConfig._percentage / 100;
            } else if (-diff > whaleConfig._chin_value) {
                current_bet_status = 2;
                bet_amount = -diff * whaleConfig._percentage / 100;
            }

            if (bull_amount > 0.6 && bear_amount > 0.6) {
                bet_amount = whaleConfig._both_max_bet_amount
                // current_bet_status = 0
            }

            if (bet_amount > whaleConfig._max_bet_amount) {
                bet_amount = whaleConfig._max_bet_amount
            }

            if (bet_status[0] == "start") {
                const txOverrides = {
                    value: ethers.utils.parseEther(bet_amount.toFixed(2).toString()),
                    gasPrice: whaleConfig._gas_price,
                    gasLimit: whaleConfig._gas_limit
                };
                try {
                    if (current_bet_status == 1) {
                        const betTx = await predContract.betBull(current_epoch + 1, txOverrides)
                        await betTx.wait(1)
                    } else if (current_bet_status == 2) {
                        const betTx = await predContract.betBear(current_epoch + 1, txOverrides)
                        await betTx.wait(1)
                    }
                } catch (e) {
                    console.log(e, "TRANSACTION WAS FAILED !!!");
                }
            }
        }
    } catch (err) { }
    setTimeout(bet_func, 5);
}


p_contract.on("StartRound", async (epoch) => {
    allBettingAddrs.length = 0
    bearTotalBettingAmount = 0;
    bullTotalBettingAmount = 0;

    targetBettingAddrs.length = 0
    cal_flag = true
    double_flag = true
    bull_amount = 0
    bear_amount = 0
    bull_users = 0
    bear_users = 0
    current_epoch = epoch.toNumber() - 1;
})

provider.on("block", async (blockNumber) => {
    const currentTime = Date.now() / 1000;
    leftTime = closeTime - currentTime;
    leftTime = leftTime.toFixed(2);

    if (leftTime < 100 && leftTime > 96) {
        console.log(`Left time is less than ${cyan}100s${resetColor}`);
    }

    if (leftTime > 0 && leftTime < 15) {
        console.log(`New block : ${cyan}${blockNumber}${resetColor} | Left time : ${cyan}${leftTime}s${resetColor}`);
    }
});

provider.on('pending', (txHash) => {
    provider.getTransaction(txHash).then(async tx => {
        if (!tx || tx.to !== config._router || parseInt(tx.data.substring(69), 16) != current_epoch + 1 || !tx.value.gt(0)) return;

        const bettingAddr = tx.from.toString().toLowerCase();
        const bettingAmount = Number(ethers.utils.formatEther(tx.value)).toFixed(4);
        const gasPriceGwei = (tx.gasPrice.toNumber() / 1e9).toFixed(2);
        const gasLimit = tx.gasLimit.toNumber();
        const isBear = tx.data.includes("0xaa6b873a");
        const isBull = tx.data.includes("0x57fb096f");
        const color = isBear ? red : isBull ? green : null;
        const betType = isBear ? "Bear" : isBull ? "Bull" : null;

        if (!allBettingAddrs.includes(bettingAddr)) {
            allBettingAddrs.push(bettingAddr)
            if (isBear) {
                bearTotalBettingAmount += Number(bettingAmount)
            } else if (isBull) {
                bullTotalBettingAmount += Number(bettingAmount)
            }
            console.log(`${color}P${betType} ===> ${bettingAddr} | ${bettingAmount} BNB | ${gasPriceGwei} GW | ${gasLimit} | ${leftTime}s${resetColor}`);
            if (bettingAmount >= 1) {
                console.log(`P${betType} ===> ${bettingAddr} | ${bettingAmount} BNB | ${gasPriceGwei} GW | ${gasLimit} | ${leftTime}s`);
            }
        }

        if (bettingAmount >= 1 && bettingAmount < 3) {
            const message_bigbet_1 = `Big User (Bear) ${bettingAmount} BNB <https://bscscan.com/address/${bettingAddr}>`
            sendMessageforChannel(message_bigbet_1, config.big_bets_1);
        } else if (bettingAmount > 3) {
            const message_bigbet_3 = `Big User (Bear) ${bettingAmount} BNB <https://bscscan.com/address/${bettingAddr}>`
            sendMessageforChannel(message_bigbet_3, config.big_bets_3);
        }

        if (!targetAddrs.includes(bettingAddr)) {
            const message_new_user = `<https://bscscan.com/address/${bettingAddr}>`;
            let round_Length = await predContract.getUserRoundsLength(bettingAddr);
            let profilt_result = await profile_contract.getUserStatus(bettingAddr)
            if (round_Length == 0) {
                targetAddrs.push(bettingAddr)
                if (!profilt_result) {
                    fs.appendFileSync("./data/dumb.txt", bettingAddr + "\n");
                    sendMessageforChannel(message_new_user, config.new_user)
                }
                console.log(yellow, `⚠︎ PTARGET IS ADDED ===> ${bettingAddr} | ${profilt_result} | ${leftTime}s`)
            }

            if (whaleConfig._special_flag && !copierAddresses.includes(bettingAddr) && [210000, 220000].includes(gasLimit)) {
                targetAddrs.push(bettingAddr)
                if (!profilt_result) {
                    fs.appendFileSync("./data/dumb.txt", bettingAddr + "\n");
                    sendMessageforChannel(message_new_user, config.new_user)
                }
                console.log(yellow, `⚠︎ PTARGET IS ADDED ===> ${bettingAddr} | ${profilt_result} | ${leftTime}s`)
            }
        }

        if (targetAddrs.includes(bettingAddr)) {
            if (!targetBettingAddrs.includes(bettingAddr)) {
                const betType = isBear ? "Bear" :
                    isBull ? "Bull" : null;
                console.log(yellow, `P${betType} ===> ${bettingAddr} | ${bettingAmount} BNB | ${gasPriceGwei} GW | ${gasLimit} | ${leftTime}s`)

                if (bettingAmount >= 0.1) {
                    sendMessageforChannel(`Whale (${betType}) ${bettingAmount} BNB <https://bscscan.com/address/${bettingAddr}>`, config.whale_channel)
                }

                targetBettingAddrs.push(bettingAddr)

                provider.once(txHash, (receipt) => {
                    if (!receipt) return;

                    if (receipt.status === 0) {
                        // console.log(`❌ TX failed: ${bettingAddr} ${leftTime}`);
                    } else {
                        if (isBull && gasLimit >= 104132) {
                            // console.log("✅ Final bull bet", leftTime);
                            bull_users += 1;
                            bull_amount += Number(bettingAmount);
                        }
                        if (isBear && gasLimit >= 124051) {
                            // console.log("✅ Final bear bet", leftTime);
                            bear_users += 1;
                            bear_amount += Number(bettingAmount);
                        }
                    }
                });
            }
        }

        if (botAddr == bettingAddr) {
            console.log(`${blue}MyBet ===> ${bettingAddr} | ${bettingAmount} BNB | ${gasPriceGwei} GW | ${gasLimit} | ${leftTime}s${resetColor}`);
        }
    })
});

p_contract.on("BetBear", async (sender, epoch, amount, event) => {
    const txHash = event.transactionHash;
    const tx = await provider.getTransaction(txHash);
    const bettingAddr = sender.toString().toLowerCase();
    const bettingAmount = Number(ethers.utils.formatEther(amount)).toFixed(4);
    const gasPriceGwei = tx.gasPrice ? (tx.gasPrice.toNumber() / 1e9).toFixed(2) : "N/A";
    const gasLimit = tx.gasLimit ? tx.gasLimit.toNumber() : "N/A";

    if (!allBettingAddrs.includes(bettingAddr)) {
        allBettingAddrs.push(bettingAddr)
        bearTotalBettingAmount += Number(bettingAmount)
        console.log(`${red}HBear ===> ${bettingAddr} | ${bettingAmount} BNB | ${gasPriceGwei} GW | ${gasLimit} | ${leftTime}s${resetColor}`);
        if (bettingAmount >= 1) {
            console.log(`HBear ===> ${bettingAddr} | ${bettingAmount} BNB | ${gasPriceGwei} GW | ${gasLimit} | ${leftTime}s`);
        }
    }

    if (!targetAddrs.includes(bettingAddr)) {
        let round_Length = await predContract.getUserRoundsLength(bettingAddr);
        let profilt_result = await profile_contract.getUserStatus(bettingAddr)
        if (round_Length == 1) {
            targetAddrs.push(bettingAddr)
            if (!profilt_result) {
                fs.appendFileSync("./data/dumb.txt", bettingAddr + "\n");
                sendMessageforChannel(`<https://bscscan.com/address/${bettingAddr}>`, config.new_user)
            }
            console.log(yellow, `⚠︎ HTARGET IS ADDED ===> ${bettingAddr} | ${leftTime}s`)
        }
    }

    if (targetAddrs.includes(bettingAddr) && !targetBettingAddrs.includes(bettingAddr)) {
        console.log(yellow, `TBear ===> ${bettingAddr} | ${bettingAmount} BNB | ${gasPriceGwei} GW | ${gasLimit} | ${leftTime}s`)

        if (bettingAmount >= 0.1) {
            const message_whale = `Whale (Bear) ${bettingAmount} BNB <https://bscscan.com/address/${bettingAddr}>`
            sendMessageforChannel(message_whale, config.whale_channel)
        }

        targetBettingAddrs.push(bettingAddr)
        provider.once(txHash, (receipt) => {
            if (receipt?.status === 0) {
                // console.log(`❌ Transaction ${bettingAddr} failed.`);
            } else {
                // console.log("✅ bear bet", leftTime);
                bear_users += 1;
                bear_amount += Number(bettingAmount);
            }
        });
    }
})

p_contract.on("BetBull", async (sender, epoch, amount, event) => {
    const txHash = event.transactionHash;
    const tx = await provider.getTransaction(txHash);
    const bettingAddr = sender.toString().toLowerCase();
    const bettingAmount = Number(ethers.utils.formatEther(amount)).toFixed(4);
    const gasPriceGwei = tx.gasPrice ? (tx.gasPrice.toNumber() / 1e9).toFixed(2) : "N/A";
    const gasLimit = tx.gasLimit ? tx.gasLimit.toNumber() : "N/A";

    if (!allBettingAddrs.includes(bettingAddr)) {
        allBettingAddrs.push(bettingAddr)
        bullTotalBettingAmount += Number(bettingAmount)
        console.log(`${green}HBull ===> ${bettingAddr} | ${bettingAmount} BNB | ${gasPriceGwei} GW | ${gasLimit} | ${leftTime}s${resetColor}`);
        if (bettingAmount >= 1) {
            console.log(`HBull ===> ${bettingAddr} | ${bettingAmount} BNB | ${gasPriceGwei} GW | ${gasLimit} | ${leftTime}s`);
        }
    }

    if (!targetAddrs.includes(bettingAddr)) {
        let round_Length = await predContract.getUserRoundsLength(bettingAddr);
        let profilt_result = await profile_contract.getUserStatus(bettingAddr)
        if (round_Length == 1) {
            targetAddrs.push(bettingAddr)
            if (!profilt_result) {
                fs.appendFileSync("./data/dumb.txt", bettingAddr + "\n");
                sendMessageforChannel(`<https://bscscan.com/address/${bettingAddr}>`, config.new_user)
            }
            console.log(yellow, `⚠︎ HTARGET IS ADDED ===> ${bettingAddr} |  ${leftTime}s`)
        }
    }

    if (targetAddrs.includes(bettingAddr) && !targetBettingAddrs.includes(bettingAddr)) {
        console.log(yellow, `TBull ===> ${bettingAddr} | ${bettingAmount} BNB | ${gasPriceGwei} GW | ${gasLimit} | ${leftTime}s`)

        if (bettingAmount >= 0.1) {
            const message_whale = `Whale (Bull) ${bettingAmount} BNB <https://bscscan.com/address/${bettingAddr}>`
            sendMessageforChannel(message_whale, config.whale_channel)
        }

        targetBettingAddrs.push(bettingAddr)
        provider.once(txHash, (receipt) => {
            if (receipt?.status === 0) {
                // console.log(`❌ Transaction ${bettingAddr} failed.`);
            } else {
                // console.log("✅ bull bet", leftTime);
                bull_users += 1
                bull_amount += Number(bettingAmount);
            }
        });
    }
})

async function betToEpoch1(epoch, isBull, wallet, privateKey, amount, gasfee, gaslimit) {
    console.log(epoch, isBull, wallet, amount, gasfee, gaslimit)
    try {
        var data, estimation;
        if (isBull == true) {
            data = predictContract.methods.betBull(epoch).encodeABI();
            estimation = await predictContract.methods.betBull(epoch).estimateGas({
                from: wallet,
                value: amount * 10 ** 18,
            });
        } else {
            data = predictContract.methods.betBear(epoch).encodeABI();
            estimation = await predictContract.methods.betBear(epoch).estimateGas({
                from: wallet,
                value: amount * 10 ** 18,
            });
        }
        var rawTransaction;
        if (config._normal_or_high == "high") {
            rawTransaction = {
                from: wallet,
                to: config._router,
                value: amount * 10 ** 18,
                gas: gaslimit,
                gasPrice: gasfee,
                data: data,
            };
        } else {
            rawTransaction = {
                from: wallet,
                to: config._router,
                value: amount * 10 ** 18,
                gas: gaslimit,
                gasPrice: gasfee,
                data: data,
            };
        }

        var signedTx = await web3.eth.accounts.signTransaction(
            rawTransaction,
            privateKey
        );
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    } catch (err) {
        console.log(err)
    }
}

async function sendMessageforChannel(message, webHook) {
    try {
        const data = { content: message };
        await axios.post(webHook, data);
    } catch (error) { }
}

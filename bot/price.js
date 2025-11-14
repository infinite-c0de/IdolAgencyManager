const axios = require('axios');
const ethers = require("ethers");
let websocketURL = "ws://127.0.0.1:27546";

const configs = require("../config/bot.json");
const oracleAbi = require("../config/abis/oracleAbi.json");

const provider = new ethers.providers.WebSocketProvider(websocketURL);
const o_contract = new ethers.Contract(configs._chainlink, oracleAbi, provider);

let bid_price = 0;
let current_price = 0;
let binance_price = 0;
let oracle_price = 0;
let price_counter = 0;
const url = "https://api.binance.com/api/v3/depth?limit=1&symbol=BNBUSDT";

console.log("Starting Price Bot... ");
read_diff();

async function read_diff() {
    oracle_Data = await o_contract.latestRoundData();
    current_price = (Number(oracle_Data.answer) / 10 ** 8).toFixed(4);
    const response = await fetch(url);
    const jsonResponse = await response.json();
    bid_price = jsonResponse.bids[0][0];
    binance_price += Number(bid_price);
    oracle_price += Number(current_price);
    price_counter++;
    let diff_pric = oracle_price / price_counter - binance_price / price_counter
    let message = "oracle vs binance : " + diff_pric.toFixed(4) + "( " + Number(current_price) + "   :   " + Number(bid_price) + " )"
    sendMessageforChannel(message, configs.price)
    setTimeout(read_diff, 1000);
}

async function sendMessageforChannel(message, webHook) {
    try {
        const data = { content: message };
        await axios.post(webHook, data);
    } catch (error) { }
}

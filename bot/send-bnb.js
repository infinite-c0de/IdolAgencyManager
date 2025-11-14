const readline = require('readline');
const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3("http://127.0.0.1:27545");

const pk = require('../config/addr/pk.json');
const pa = require('../config/addr/public.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let flag = 1;
let walletAddress = "";

async function getBalanceOf(addr) {
    try {
        const res = await web3.eth.getBalance(addr);
        console.log(`Balance: ${res / 10 ** 18} ETH`);
        return res / 10 ** 18;
    } catch (err) {
        console.error('Error getting balance:', err);
    }
}

async function sendToMain(start, private_key, amount, end) {
    try {
        if (end !== "") {
            const gasEstimate = await web3.eth.estimateGas({
                to: end,
                value: amount * 10 ** 18
            });
            const gasPrice = await web3.eth.getGasPrice();
            const txFee = gasPrice * gasEstimate;

            const rawTransaction = {
                from: start,
                to: end,
                gas: gasEstimate,
                gasPrice: gasPrice,
                value: amount * 10 ** 18 - txFee // Adjust value based on transaction fee
            };

            const signedTx = await web3.eth.accounts.signTransaction(
                rawTransaction,
                private_key
            );

            await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log('Transaction sent successfully!');
        }
    } catch (err) {
        console.error('Error sending transaction:', err);
    }
}

async function processInput(input) {
    if (flag === 1) {
        if (input.toLowerCase() === 'quit') {
            console.log('Exiting the program...');
            rl.close();
            return;
        }

        if (input === "all") {
            const balance = await getBalanceOf(walletAddress);
            await sendToMain(walletAddress, pk._p_key, balance, pa._htx_addr_1);
        } else if (input !== "0") {
            const amount = parseFloat(input);
            await sendToMain(walletAddress, pk._p_key, amount, pa._htx_addr_1);
        }

        walletAddress = web3.eth.accounts.privateKeyToAccount(pk._p_key).address;
        const balance = await getBalanceOf(walletAddress);
        console.log(`Wallet Address: ${walletAddress}, Balance: ${balance} ETH`);
        rl.question('Enter amount (or type "all" to send all): ', processInput);
    }
}

(async () => {
    if (flag === 1) {
        walletAddress = web3.eth.accounts.privateKeyToAccount(pk._p_key).address;
        const balance = await getBalanceOf(walletAddress);
        console.log(`Wallet Address: ${walletAddress}, Balance: ${balance} ETH`);
        rl.question('Enter amount (or type "all" to send all): ', processInput);
    }
})();

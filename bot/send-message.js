const Web3 = require('web3');
const web3 = new Web3('https://bsc-dataseed.binance.org/');

const pk = require('../config/addr/pk.json');
const pa = require("../config/addr/public.json")

sendMessage();
async function sendMessage() {
    const receiverAddress = "";
    const message = "";

    const messageHex = web3.utils.asciiToHex(message);
    const nonce = await web3.eth.getTransactionCount(pa._bot_addr);

    for (var i = 0; i < 30; i++) {
        web3.eth.accounts.signTransaction({
            nonce: nonce + i,
            to: receiverAddress,
            data: messageHex,
            gas: 150000,
            gasPrice: web3.utils.toWei('1', 'gwei'),
        }, pk._p_key).then(signedTx => {
            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                .on('receipt', receipt => {
                    // console.log('Transaction Receipt:', receipt);
                })
                .on('error', error => {
                    // console.error('Transaction Error:', error);
                });
        });
    }
}

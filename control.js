const prompts = require('@inquirer/prompts');
const fs = require('fs');
const { exec } = require('child_process');
const process = require('process');

let lastActionTime = Date.now();
const CHECK_INTERVAL = 5000;
const TIME_LIMIT = 30 * 60 * 1000;

function writeDirection(direction, amount = null) {
  fs.writeFileSync('data/bet_status.txt', direction, 'utf8');

  if (amount !== null) {
    fs.writeFileSync('data/amount.txt', amount, 'utf8');
  }
}

function checkAutoStop() {
  setInterval(() => {
    const currentTime = Date.now();
    if (currentTime - lastActionTime >= TIME_LIMIT) {
      writeDirection('auto stopped');
      lastActionTime = currentTime;
    }
  }, CHECK_INTERVAL);
}

async function main() {
  checkAutoStop();

  while (true) {
    const action = await prompts.select({
      type: 'select',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { title: 'neither', value: 'neither' },
        { title: 'start', value: 'start' },
        { title: 'restart', value: 'restart' },
        // { title: 'high payout', value: 'high payout' },
        { title: 'fixedBull', value: 'fixedBull' },
        { title: 'fixedBear', value: 'fixedBear' },
        { title: 'exit', value: 'exit' }
      ]
    });

    lastActionTime = Date.now();

    if (action === 'neither') {
      writeDirection('neither');
    } else if (action === 'start') {
      writeDirection('start');
    } else if (action === 'restart') {
      exec('pm2 restart bot', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error restarting whale: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      });
    } else if (action === 'high payout') {
      writeDirection('both');
    } else if (action === 'fixedBull') {
      const amount = await prompts.input({
        type: 'input',
        name: 'amount',
        message: 'Enter the amount for fixedBull:'
      });
      writeDirection('fixedBull', amount);
    } else if (action === 'fixedBear') {
      const amount = await prompts.input({
        type: 'input',
        name: 'amount',
        message: 'Enter the amount for fixedBear:'
      });
      writeDirection('fixedBear', amount);
    } else if (action === 'exit') {
      process.kill(process.pid, 'SIGINT');
      break;
    }
  }
}

process.on('SIGINT', () => {
  console.log('\n');
  process.exit(0);
});

main();

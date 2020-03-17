const ApiInstance = require('iwan-sdk');

//In order to get an YourApiKey and YourSecretKey, sign up at iWan. Then create a new project to get a new YourApiKey and YourSecretKey key pair.
let YourApiKey = "ae8a283e999e4fbba7ea54d6692806efea33b51bf797128a32d3d352d7a214e2";
let YourSecretKey = "7897dde450229bb1da66c8cda21639d95b0248949ad48c1b618f99f2b7e23c31";

//Subject to https://iwan.wanchain.org
let option = {
  url: "api2.wanchain.org",
  port: 8443,
  flag: "ws",
  version: "v3"
};

let apiTest = new ApiInstance(YourApiKey, YourSecretKey, option);

let testArray = [
  ['getRegisteredValidator', 'WAN', '0x0288c83219701766197373d1149f616c62b52a7d'],
];

let addresses = {};


async function main() {
  try {
    // console.log('Total:', testArray.length);
    // let result = await apiTest.getBalance('WAN', '0x4e6b5f1abdd517739889334df047113bd736c546');
    // console.log('balance:', result);

    let currentStakerInfo = await apiTest['getCurrentStakerInfo']('WAN');
    // console.log(ret);
    // return;

    // for (var m=0; m<currentStakerInfo.length; m++) {
    //   if ('0xf9393474e1b86c7f8e224b9d36529a9bb6542ab7' == currentStakerInfo[m].address) {
    //     console.log(currentStakerInfo[m])
    //   }
    // }

    // return;


    let startEpoch = 18157;
    let endEpoch = 18337;

    testArray = []
    for (let i=0; i<endEpoch-startEpoch; i++) {
      testArray[i] = ['getLeaderGroupByEpochID', 'WAN', startEpoch + i];
    }

    for (let i=0; i<testArray.length; i++) {
      await apiCall(testArray[i][0], testArray[i][1], testArray[i][2]);
      console.log(i);
    }

    for (var i in addresses) {
      let ret = await apiTest['getRegisteredValidator'](i);
      addresses[i].name = ret[0]?ret[0].name:i;
      // addresses[i].addr = i;
      for (var m=0; m<currentStakerInfo.length; m++) {
        if (i == currentStakerInfo[m].address) {
          addresses[i].votingPower = Number(currentStakerInfo[m].votingPower)
          addresses[i].amount = Number(currentStakerInfo[m].amount)
          if (currentStakerInfo[m].partners) {
            for (var n=0; n<currentStakerInfo[m].partners.length; n++) {
              addresses[i].votingPower += Number(currentStakerInfo[m].partners[n].votingPower);
              addresses[i].amount += Number(currentStakerInfo[m].partners[n].amount);
            }
          }

          if (currentStakerInfo[m].clients) {
            for (var n=0; n<currentStakerInfo[m].clients.length; n++) {
              addresses[i].votingPower += Number(currentStakerInfo[m].clients[n].votingPower);
              addresses[i].amount += Number(currentStakerInfo[m].clients[n].amount);
            }
          }
        }
      }
      console.log(addresses[i]);
    }


    // console.log(addresses);

    apiTest.close();
    process.exit(0);
  } catch (err) {
    console.log(err);
    apiTest.close();
    process.exit(1);
  }
}

async function apiCall(name, chain = 'WAN', value) {
  let ret = await apiTest[name](chain, value);
  for (let i=0; i<ret.length; i++) {
    if (ret[i].pubBn256.length < 3) {
      continue;
    }

    if (!addresses[ret[i].secAddr]) {
      addresses[ret[i].secAddr] = {};
      addresses[ret[i].secAddr].times = 0
    }

    if (ret[i].secAddr == '0xf9393474e1b86c7f8e224b9d36529a9bb6542ab7') {
      // console.log('Find wetez!', value, ret[i]);
    }

    addresses[ret[i].secAddr].times++;
  }
  return ret;
}

main();
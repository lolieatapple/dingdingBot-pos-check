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
    let missed = [];
    for(let i=18350; i<=18388; i++) {
      let ret = await apiTest['getValidatorActivity']('WAN', i);
      if (!ret) {
        break;
      }

      for (let m=0;  m<ret.epActivity.length; m++) {
        if (ret.epActivity[m] == 0) {
          missed.push([i, ret.epLeader[m], 'EL', ret.epActivity[m]]);
        }
      }

      for (let m=0;  m<ret.rpActivity.length; m++) {
        if (ret.rpActivity[m] == 0) {
          missed.push([i, ret.rpLeader[m], 'RNP', ret.rpActivity[m]]);
        }
      }
    }
    
    for (let i=0; i<missed.length; i++) {
      let info = await apiTest.getRegisteredValidator(missed[i][1]);
      console.log(...missed[i], info[0]?info[0].name:'none');
    }

    apiTest.close();
    process.exit(0);
  } catch (err) {
    console.log(err);
    apiTest.close();
    process.exit(1);
  }
}

main();
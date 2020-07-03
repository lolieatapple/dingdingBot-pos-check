const ApiInstance = require('iwan-sdk');
const schedule = require('node-schedule');
const axios = require('axios');
const { API_KEY, SEC_KEY, dingdingBotUrl } = require('./config');

//In order to get an YourApiKey and YourSecretKey, sign up at iWan. Then create a new project to get a new YourApiKey and YourSecretKey key pair.
let YourApiKey = API_KEY;
let YourSecretKey = SEC_KEY;

//Subject to https://iwan.wanchain.org
let option = {
  url: "api.wanchain.org",
  port: 8443,
  flag: "ws",
  version: "v3"
};


let testArray = [
  ['getRegisteredValidator', 'WAN', '0x0288c83219701766197373d1149f616c62b52a7d'],
];

let addresses = {};


async function main() {
  try {
    let apiTest = new ApiInstance(YourApiKey, YourSecretKey, option);
    let missed = [];
    let epochId = await apiTest.getEpochID('WAN');
    console.log('current epoch:', epochId);
    for (let i = epochId - 2; i <= epochId; i++) {
      let ret = await apiTest['getValidatorActivity']('WAN', i);
      if (!ret) {
        break;
      }

      for (let m = 0; m < ret.epActivity.length; m++) {
        if (ret.epActivity[m] == 0) {
          missed.push([i, ret.epLeader[m], 'EL', ret.epActivity[m]]);
        }
      }

      for (let m = 0; m < ret.rpActivity.length; m++) {
        if (ret.rpActivity[m] == 0) {
          missed.push([i, ret.rpLeader[m], 'RNP', ret.rpActivity[m]]);
        }
      }
    }

    let msg = "检测到POS活跃度异常节点！当前epochID是" + epochId + "\n" + "最近3天内活跃异常节点信息如下：\n";

    for (let i = 0; i < missed.length; i++) {
      let info = await apiTest.getRegisteredValidator(missed[i][1]);
      console.log(...missed[i], info[0] ? info[0].name : 'none');
      let title = missed[i].toString();
      let name = info[0] ? info[0].name : 'none';
      msg += title;
      msg += " " + name;
      msg += "\n";
    }

    if (missed.length > 0) {
      console.log(msg);
      await dingdingSend(msg);
    }


    apiTest.close();
  } catch (err) {
    console.log(err);
    apiTest.close();
  }
}

const dingdingSend = async (msg) => {
  let format = {
    "msgtype": "text",
    "text": {
      "content": msg
    },
  };
  let ret = await axios.post(dingdingBotUrl, format);
  console.log(ret.data);
}

// * * * * * *
// second minute hour day month dayOfWeek
const robotSchedules = () => {
  // update: The settlement robot calls this function daily to update the capital pool and settle the pending refund.
  schedule.scheduleJob('*/10 * * * * *', async () => {
    let msg = await main();
    console.log(msg);
  });
}

robotSchedules();
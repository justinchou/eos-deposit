const schedule = require('node-schedule');
const EosDeposit = require("../lib/EosDeposit");

const account = "tokiyotomare";
const node = "https://proxy.eosnode.tools";

const eos = new EosDeposit();
eos.init(node, account).start();
eos.on("RecvTransaction", data => {
  console.log(data);
});


const EosDeposit = require("../lib/EosDeposit");

const account = "wumingxiaozu";
const node = "https://proxy.eosnode.tools";

const eos = new EosDeposit();
eos.init(node, account);
eos.getTransactions();

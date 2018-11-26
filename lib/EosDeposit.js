const got = require("got");
const qs = require("qs");
const schedule = require('node-schedule');

const BaseDeposit = require("./BaseDeposit");

class EosDeposit extends BaseDeposit {
  constructor(config) {
    super();

    this.status  = BaseDeposit.STATUS.STOPED;

    this.config  = config;

    this.timer   = "*/1 * * * *";
    this.account = "";
    this.baseUrl = "";

    this.lastPointer = 0;
    this.groupAmount = 20;
    this.job         = null;
  }

  init(baseUrl, account) {
    if (this.status === BaseDeposit.STATUS.STOPED) {
      this.account = account;
      this.baseUrl = baseUrl;
    }

    return this;
  }

  refreshPointer(lastPointer, groupAmount) {
    if (this.status === BaseDeposit.STATUS.STARTED) {
      this.lastPointer = lastPointer;
      this.groupAmount = groupAmount;
    }

    return this;
  }

  // curl --request POST -d '{"account_name":"wumingxiaozu"}' --url https://proxy.eosnode.tools/v1/history/get_actions
  async getActions(start, len) {
    if (this.status !== BaseDeposit.STATUS.STARTED) return;

    const api = "/v1/history/get_actions";

    const body = {"account_name": this.account,};
    if (Number.isInteger(start) && Number.isInteger(len) && start >= 0 && len >= 0) {
      body.pos = start;
      body.offset = len;
    }

    const ret = await got.post(`${this.baseUrl}${api}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = {
      statusCode: ret.statusCode,
      headers: ret.headers,
      body: JSON.parse(ret.body),
    };

    return data;
  }

  start() {
    if (this.status !== BaseDeposit.STATUS.STOPED) return this;
    this.status = BaseDeposit.STATUS.STARTING;

    this.job = schedule.scheduleJob(this.timer, async () => {
      this.status = BaseDeposit.STATUS.STARTED;

      let ret;
      try {
        ret = await this.getActions(161, 20);
        if (!ret || ret.statusCode !== 200 || !ret.body) {
          console.log("api return invalid body %j", ret);
          return;
        }
      } catch (err) {
        console.error("get transaction failed %s", err.message);
        return;
      }

      console.log("%j", ret.body);
      this.emit("onRecvTransaction", ret.body);
    });

    return this;
  }

  stop() {
    if (this.status !== BaseDeposit.STATUS.STARTED) return this;
    this.status = BaseDeposit.STATUS.STOPING;

    job.cancel(() => {
      this.status = BaseDeposit.STATUS.STOPED;
    });

    return this;
  }
}

module.exports = EosDeposit;


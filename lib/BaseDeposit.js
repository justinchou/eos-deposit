const EventEmitter = require("events").EventEmitter;

class BaseDeposit extends EventEmitter {
  constructor() {
    super();
  }

  init() {}
  start() {}
  stop() {}

  getTransactions() {}
}

BaseDeposit.STATUS = {
  "STOPED": 0,
  "STARTING": 1,
  "STARTED": 2,
  "STOPING": 3,
};

module.exports = BaseDeposit;

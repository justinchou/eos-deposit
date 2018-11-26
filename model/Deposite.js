class Deposit {
  constructor(config) {
    this.config = config;

    this.lastPointer = 0;
    this.latestPointer = 0;

    this.schedule = null;
  }

  refresh(lastPointer, latestPointer) {
    this.lastPointer = lastPointer;
    this.lastestPointer = latestPointer;
  }

  startSchedule() {
    this.
  }
}

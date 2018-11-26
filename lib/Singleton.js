let instance = null;

class Singleton {
  constructor() {
    this.state = null;

    this.reset();
  }

  reset() {
    this.state = {};
  }

  configure(config) {}
  start() {}
  stop() {}
}

const getInstance = () => {
  if (!(instance instanceof Singleton)) {
    instance = new Singleton();
  }
  return instance;
}
exports.getInstance = getInstance;


// 文件直接被执行
if (require.main === module) {
  let first = getInstance();
  let second = getInstance();
  console.log(first === second);
  //output: true
}



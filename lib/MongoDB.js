const MongoClient = require('mongodb').MongoClient;

let instance = {};

const connect = ({url, dbName, user="", password=""}, next) => {
  const uniqID = genUniqID({url, dbName, user, password});

  console.log("Create Connection [ %j ] [ %s ]", {url, dbName, user, password}, uniqID);

  const config = {
    auto_reconnect: true,
    useNewUrlParser: true,
    authSource: "admin",
  };
  if (user) {
    config.auth = {
      user,
    };
    if (password) {
      config.auth.password = password;
    }
  }

  MongoClient.connect(url, config, (err, client) => {
    if (err) return next(err);

    console.log("Connected successfully to server");

    const databaseConnection = client.db(dbName);
    instance[uniqID] = databaseConnection;
    instance[uniqID].client = client;

    next(null, databaseConnection);
  });
}

const genUniqID = ({url, dbName, user="", password=""}) => {
  return `${url}-${dbName}-${user}-${password}`;
}

const getInstance = (config, next) => {
  const uniqID = genUniqID(config);

  if (instance[uniqID]) {
    next(instance[uniqID]);
    return;
  }

  connect(config, next);
};
exports.getInstance = getInstance;

const getInstanceAsync = (config) => {
  const uniqID = genUniqID(config);

  return new Promise((resolve, reject) => {
    if (instance[uniqID]) {
      resolve(instance[uniqID]);
      return;
    }
    connect(config, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};
exports.getInstanceAsync = getInstanceAsync;

const closeInstance = (config) => {
  let flag = true;
  if (config && config.url && config.dbName) {
    const uniqID = genUniqID(config);
    if (instance[uniqID] && instance[uniqID].client && typeof instance[uniqID].client === 'object' && typeof instance[uniqID].client.close === 'function') {
      flag = flag && instance[uniqID].client.close();
      delete instance[uniqID];
    }
  }

  if (config && config.client && typeof config.client === 'object' && typeof config.client.close === 'function') {
    flag = flag && config.client.close();
    const uniqIDs = Object.keys(instance);

    for (let idx = 0; idx < uniqIDs.length; idx++) {
      const uniqID = uniqIDs[idx];

      if (instance[uniqID] === config) {
        delete instance[uniqID];
      }
    }
  }

  return flag;
}
exports.closeInstance = closeInstance;

const closeAllInstance = () => {
  const uniqIDs = Object.keys(instance);

  let flag = true;
  for (let idx = 0; idx < uniqIDs.length; idx++) {
    const uniqID = uniqIDs[idx];
    flag = flag && closeInstance(instance[uniqID]);
  }

  return flag;
}

// 测试用代码 
if (require.main === module) {
  const url = "mongodb://localhost:32768";
  const dbName = "test";
  const user = "";
  const password = "";

  const debug = async () => {
    const dbIns = await getInstanceAsync({url, dbName, user, password});
    
    // 指定 collection/table
    const coll = dbIns.collection('userinfo');
    coll.find({}).limit(10).toArray((err, items) => {
      if (err) console.error(err);
      else console.log("Items: [ %j ]", items);

      // closeInstance({url, dbName, user, password});
      closeInstance(dbIns);
      // closeAllInstance();
    });
  };
  debug();
}


const DB_NAME = "KaiAuthDB";
const STORE_NAME = "app_data";
const IS_KAIOS = window.navigator.userAgent.includes("KAIOS");
let isInitializing = true;

// --- IndexedDB 核心管理 ---
const dbPromise = new Promise(function (resolve, reject) {
  const request = window.indexedDB.open(DB_NAME, 1);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  };

  request.onsuccess = function (event) {
    resolve(event.target.result);
  };

  request.onerror = function (event) {
    console.error("IndexedDB 启动失败", event.target.error);
    reject(event.target.error);
  };
});

// --- 通用存取逻辑 ---
function saveData(key, value) {
  if (IS_KAIOS) {
    dbPromise.then(function (db) {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      // put 自动处理 add 或 update
      store.put(value, key);
    }).catch(function (err) {
      console.error("写入失败:", err);
    });
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

function getDataPromise(key) {
  if (IS_KAIOS) {
    return dbPromise.then(function (db) {
      return new Promise(function (resolve, reject) {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = function () {
          resolve(request.result);
        };
        request.onerror = function () {
          reject(request.error);
        };
      });
    });
  } else {
    const value = localStorage.getItem(key);
    try {
      return Promise.resolve(value ? JSON.parse(value) : undefined);
    } catch (e) {
      return Promise.resolve(undefined);
    }
  }
}

// --- AppData 响应式代理 ---
const AppData = new Proxy({
  pin: '',
  tokens: []
}, {
  set(target, key, value) {
    target[key] = value;
    console.log("数据变动:", key, value);

    if (isInitializing) {
      return true;
    }

    // 仅在非初始化阶段持久化
    if (key === "pin" || key === "tokens") {
      saveData(key, value);
    }
    return true;
  }
});

window.AppData = AppData;

// --- 初始化入口 ---
function loadAppData(onLoad) {
  console.log("正在加载 AppData...");

  const loadPin = getDataPromise("pin");
  const loadTokens = getDataPromise("tokens");

  Promise.all([loadPin, loadTokens]).then(function (results) {
    console.log("读取到的原始数据:", results);

    // 标记初始化，防止 set 再次触发写入
    isInitializing = true;
    AppData.pin = results[0] || '';
    AppData.tokens = results[1] || [];

    // 关键：延时一小下或直接关闭，确保同步逻辑完成
    isInitializing = false;

    console.log("初始化完成");
    if (typeof onLoad === "function") {
      onLoad(AppData);
    }
  }).catch(function (err) {
    console.error("数据加载异常:", err);
    isInitializing = false;
    if (typeof onLoad === "function") onLoad(AppData);
  });
}
const isDev = true;

let pin = ''
// Dev 模式使用 localstorage 存储数据
if (isDev) {
  pin = localStorage.getItem("pin")
}

const AppData = new Proxy({
  pin,
}, {
  set(target, key, value) {
    target[key] = value;
    switch (key) {
      case "pin": {
        // TODO 加密
        localStorage.setItem("pin", `${value}`)
      }
    }
    return true;
  }
});

window.AppData = AppData;
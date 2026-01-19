// dependency: lib.softkeys.js

const viewPinEl = document.getElementById('view-pin');
const viewListEl = document.getElementById('view-list');
// PIN 码输入提示
const viewPinPromptEl = document.getElementById('pin-prompt');
// PIN 码的小圆点
const viewPinDotsEl = [0, 1, 2, 3].map(i => document.getElementById(`dot-${i}`));

// 渲染 PIN 码的小圆点
function renderPinDots(pinLength) {
  viewPinDotsEl.forEach((dot, index) => {
    if (index < pinLength) {
      dot.classList.add('filled');
    } else {
      dot.classList.remove('filled');
    }
  });
}

// 响应式全局状态
const AppState = new Proxy({
  view: 'pin',
  pinStatus: 'input', // input(输入解锁), set1(初始化第一次输入), set2(初始化第二次输入)
  pinInput: '',
  navIndex: 0,
  timerInterval: null
}, {
  set(target, key, value) {
    target[key] = value;
    console.log("state changed", key, value);
    switch (key) {
      case "view": { // view 切换
        if (value === 'list') {
          viewPinEl.classList.remove('active');
          viewListEl.classList.add('active');
          showSoftkeys();
        } else {
          viewPinEl.classList.add('active');
          viewListEl.classList.remove('active');
          target.pinInput = '';
          renderPinDots(0);
          hideSoftkeys();
          console.log("state changed hideSoftkeys", softkeysEl.classList);
        }
        break;
      }
      case "pinStatus": { // pin 输入状态
        if (value === 'input') { // 输入解锁
          viewPinPromptEl.innerText = "请输入PIN码";
        } else if (value === "set1") { // 初始化第一次输入
          viewPinPromptEl.innerText = "请设置PIN码";
        } else if (value === "set2") { // 初始化第二次输入
          viewPinPromptEl.innerText = "请再次输入PIN码";
        }
        target.pinInput = '';
        renderPinDots(0)
        break;
      }
      case "pinInput": {
        renderPinDots(value.length)
        break;
      }
    }
    return true;
  }
});

window.AppState = AppState;
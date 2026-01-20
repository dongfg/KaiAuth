// dependency: state.js, data.js, pin.js, menu.js

const state = window.AppState;

// 初始化
function init() {
  loadAppData((appData) => {
    loadPinStatus(appData);
    state.tokens = appData.tokens;
    switch (state.view) {
      case 'pin':
        break;
      case 'list':
        renderList();
        break;
    }
    startGlobalTimer();
    // 监听全剧键盘事件
    document.addEventListener('keydown', handleKeydown);
  })
}

function updateUIItems() {
  if (state.view !== 'list') {
    return;
  }

  const epoch = Math.floor(Date.now() / 1000);
  const items = document.querySelectorAll('.token-item');

  items.forEach(function (item) {
    var timerEl = item.querySelector('.token-timer-numeric');
    var barEl = item.querySelector('.progress-fill');

    // 从 dataset 或属性中获取该 token 特有的 period
    var period = parseInt(timerEl.getAttribute('data-period'), 10) || 30;

    // 计算该 token 的剩余时间
    var timeLeft = period - (epoch % period);
    var progress = timeLeft / period;

    // 更新数字
    timerEl.textContent = timeLeft;

    // 更新进度条 (Gecko 48 支持 scaleX)
    if (barEl) {
      barEl.style.transform = 'scaleX(' + progress + ')';
    }

    // 如果某个 token 刚刚重置（倒计时回到了 period 值），刷新该条目的验证码
    // 注意：这里由于 1s 执行一次，timeLeft === period 代表新周期开始
    if (timeLeft === period) {
      // 找到该 token 对应的索引，重新计算验证码
      // 简单做法是直接调用一次 renderList，或者局部更新 code 节点
      refreshSingleTokenCode(item);
    }
  });
}

// 辅助函数：只刷新单个 Token 的验证码
function refreshSingleTokenCode(itemEl) {
  // 通过索引或其他方式找到对应 token 数据（这里假设 DOM 顺序和 state.tokens 一致）
  var index = Array.prototype.indexOf.call(itemEl.parentNode.children, itemEl);
  var token = state.tokens[index];
  if (token) {
    var codeEl = itemEl.querySelector('.token-code');
    if (codeEl) {
      codeEl.textContent = generateTOTPCode(token);
    }
  }
}

// 立即更新函数
function updateUIImmediately() {
  updateUIItems();
}

function startGlobalTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);

  state.timerInterval = setInterval(function () {
    updateUIItems();
  }, 1000);
}


// === 核心：渲染列表与 SVG ===
function renderList() {
  const listEl = document.getElementById('token-list');
  listEl.innerHTML = '';

  if (state.tokens.length === 0) {
    // 渲染空状态界面
    listEl.innerHTML = document.getElementById('empty-template').innerHTML;
    return;
  }

  state.tokens.forEach((token, index) => {
    const code = generateTOTPCode(token);

    const div = document.createElement('div');
    div.className = `token-item ${index === state.navIndex ? 'focused' : ''}`;
    var html = '<div class="token-info">' +
      '<div class="token-issuer">' + (token.issuer || 'Unknown') + '</div>' +
      (token.account ? '<div class="token-user">' + token.account + '</div>' : '') +
      '<div class="token-code">' + code + '</div>' +
      '</div>' +
      '<div class="token-timer-numeric" data-period="' + token.period + '">' +
      token.period +
      '</div>' +
      '<div class="progress-container">' +
      '<div class="progress-fill"></div>' +
      '</div>';
    div.innerHTML = html;
    listEl.appendChild(div);
  });
  updateUIImmediately();
}

// 键盘处理中心
function handleKeydown(e) {
  switch (state.view) {
    case 'pin':
      handlePinInput(e, () => {
        renderList();
      });
      break;
    case 'list':
      if (menu.isVisible) {
        menu.handleKey(e.key);
        e.preventDefault();
        return;
      }
      handleListNav(e);
      break;
  }
}

// 处理列表导航 (上下键)
function handleListNav(e) {
  if (e.key === 'ArrowDown') {
    if (state.navIndex < state.tokens.length - 1) {
      state.navIndex++;
      renderList(); // 重新渲染以更新紫色高亮
    }
  } else if (e.key === 'ArrowUp') {
    if (state.navIndex > 0) {
      state.navIndex--;
      renderList();
    }
  } else if (e.key === 'SoftLeft' || e.key === 'q') {
    const qrCode = new QRCode();
    try {
      qrCode.readAsText().then(res => {
        const token = parseTOTPURI(res);
        state.tokens = state.tokens.concat(token);
        renderList();
      }).catch(err => {
        alert(err.toString());
      })
    } catch (err) {
      console.log(err);
    }
  } else if (e.key === 'SoftRight' || e.key === 'e') {
    menu.open();
  }
}


// 启动
window.onload = init;
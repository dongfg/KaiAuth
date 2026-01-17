let state = {
  view: 'list',
  pinInput: '',
  navIndex: 0,
  timerInterval: null
};

// TODO 数据存储
const tokens = [
  { issuer: "Google", user: "bitwarden@dongfg.com" }, // Base32 密钥
  { issuer: "GitHub", user: "" }
];

// PIN 码的小圆点
const elPinDots = [0, 1, 2, 3].map(i => document.getElementById(`dot-${i}`));

// 初始化
function init() {
  console.log("App Started");
  switch (state.view) {
    case 'pin':
      renderPinDots();
      break;
    case 'list':
      renderList();
      break;
  }
  startGlobalTimer();
  updateSoftkeys();
  // 监听全剧键盘事件
  document.addEventListener('keydown', handleKeydown);
}

// 提取核心更新逻辑
function updateUIItems() {
  const epoch = Math.floor(Date.now() / 1000);
  const period = 30;
  const timeLeft = period - (epoch % period);
  const progress = timeLeft / period;

  // 更新数字水印
  document.querySelectorAll('.token-timer-numeric').forEach(el => {
    el.textContent = timeLeft;
  });

  // 更新进度条 (scaleX)
  document.querySelectorAll('.progress-fill').forEach(bar => {
    bar.style.transform = `scaleX(${progress})`;
  });

  return timeLeft;
}

// 立即更新函数
function updateUIImmediately() {
  updateUIItems();
}

// 优化后的定时器
function startGlobalTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);

  state.timerInterval = setInterval(() => {
    const timeLeft = updateUIItems();

    // 周期结束刷新列表数据
    if (timeLeft === 30) {
      renderList();
    }
  }, 1000);
}

// 渲染 PIN 码的小圆点
function renderPinDots() {
  elPinDots.forEach((dot, index) => {
    if (index < state.pinInput.length) {
      dot.classList.add('filled');
    } else {
      dot.classList.remove('filled');
    }
  });
}

// === 核心：渲染列表与 SVG ===
function renderList() {
  const listEl = document.getElementById('token-list');
  listEl.innerHTML = '';

  tokens.forEach((token, index) => {
    const code = "123 456";

    const div = document.createElement('div');
    div.className = `token-item ${index === state.navIndex ? 'focused' : ''}`;
    div.innerHTML = `
      <div class="token-info">
        <div class="token-issuer">${token.issuer}</div>
        ${token.user?'<div class="token-user">'+token.user+'</div>':''}
        <div class="token-code">${code}</div>
      </div>
      <div class="token-timer-numeric">30</div>
      <div class="progress-container">
        <div class="progress-fill"></div>
      </div>
    `;
    listEl.appendChild(div);
  });
  updateUIImmediately();
}


// PIN 界面不需要软键
function updateSoftkeys() {
  const left = document.getElementById('softkey-left');
  const right = document.getElementById('softkey-right');

  if (state.view === 'pin') {
    left.innerText = '';
    right.innerText = '';
  } else {
    left.innerText = '添加';
    right.innerText = '选项';
  }
}

// 键盘处理中心
function handleKeydown(e) {
  e.preventDefault();
  switch (state.view) {
    case 'pin':
      handlePinInput(e);
      break;
    case 'list':
      handleListNav(e);
      break;
  }
}

// 处理 PIN 输入
function handlePinInput(e) {
  // 删除
  if (e.key === 'Backspace' || e.key === 'Clear') {
    if (state.pinInput.length > 0) {
      e.preventDefault(); // 拦截系统返回，防止应用直接关闭
      state.pinInput = state.pinInput.slice(0, -1);
      renderPinDots();
    }
    else {
      window.close();
    }
    return;
  }
  // 数字键 0-9
  if (e.key >= '0' && e.key <= '9') {
    if (state.pinInput.length < 4) {
      state.pinInput += e.key;
      renderPinDots();

      // TODO 模拟输入完成
      if (state.pinInput.length === 4) {
        setTimeout(() => {
          // 切换到列表视图
          state.view = 'list';
          document.getElementById('view-pin').classList.remove('active');
          document.getElementById('view-list').classList.add('active');
          updateSoftkeys();
        }, 300);
      }
    }
  }
}

// 处理列表导航 (上下键)
function handleListNav(e) {
  if (e.key === 'ArrowDown') {
    if (state.navIndex < tokens.length - 1) {
      state.navIndex++;
      renderList(); // 重新渲染以更新紫色高亮
    }
  } else if (e.key === 'ArrowUp') {
    if (state.navIndex > 0) {
      state.navIndex--;
      renderList();
    }
  } else if (e.key === 'SoftLeft') {
    alert("点击了添加");
  } else if (e.key === 'SoftRight') {
    alert("点击了选项");
  }
}


// 启动
window.onload = init;
// dependency: state.js, data.js, pin.js, menu.js

const state = window.AppState;

// TODO 数据存储
const tokens = [
  { issuer: "Google", user: "bitwarden@dongfg.com" }, // Base32 密钥
  { issuer: "GitHub", user: "" }
];

// 初始化
function init() {  
  loadAppData((appData) => {
    loadPinStatus(appData);
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
        ${token.user ? '<div class="token-user">' + token.user + '</div>' : ''}
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
    if (state.navIndex < tokens.length - 1) {
      state.navIndex++;
      renderList(); // 重新渲染以更新紫色高亮
    }
  } else if (e.key === 'ArrowUp') {
    if (state.navIndex > 0) {
      state.navIndex--;
      renderList();
    }
  } else if (e.key === 'SoftLeft' || e.key === 'q') {
    alert("点击了添加");
  } else if (e.key === 'SoftRight' || e.key === 'e') {
    menu.open();
  }
}


// 启动
window.onload = init;
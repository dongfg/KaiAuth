function loadPinStatus(appData) {
  const state = window.AppState;
  if (appData.pin && appData.pin.length) {
    state.pinStatus = 'input';
  } else {
    state.pinStatus = 'set1';
  }
}

let pinSet1 = ''

// 处理 PIN 输入
function handlePinInput(e, onPinSucess) {
  const state = window.AppState;
  // 删除
  if (e.key === 'Backspace' || e.key === 'Clear') {
    if (state.pinInput.length > 0) {
      e.preventDefault(); // 拦截系统返回，防止应用直接关闭
      state.pinInput = state.pinInput.slice(0, -1);
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

      // 输入完成
      if (state.pinInput.length === 4) {
        switch (state.pinStatus) {
          case "input": {
            // TODO 用加密算法比较
            if (state.pinInput !== window.AppData.pin) {
              setTimeout(() => {
                alert("PIN码输入错误");
                state.pinStatus = 'input';
              }, 300);
              break;
            }
            setTimeout(() => {
              state.view = 'list';
              onPinSucess();
            }, 300);
            break;
          }
          case "set1": {
            pinSet1 = state.pinInput;
            state.pinStatus = 'set2';
            break;
          }
          case "set2": {
            if (state.pinInput !== pinSet1) {
              setTimeout(() => {
                alert("两次PIN码输入不一致");
                state.pinStatus = 'set1';
              }, 300);
              break;
            }
            setTimeout(() => {
              // 保存pin码
              window.AppData.pin = state.pinInput;
              // view 跳转
              state.view = 'list';
              setTimeout(() => {
                state.pinStatus = 'input';
                onPinSucess();
              }, 300);
            }, 300);
            break;
          }
        }
      }
    }
  }
}
// dependency: lib/softkeys.js, lib/option-menu.js

// 初始化 OptionMenu ---
const menu = new OptionMenu({
  id: 'option-menu',
  items: [
    { label: '删除', key: 'delete' },
    { label: '锁定', key: 'lock' },
    { label: '退出应用', key: 'quit' }
  ],
  onOpen: () => {
  },
  onClose: () => {
  },
  // 当选中某一项时
  onSelect: (key) => {
    if (key === 'delete') {
      if (window.AppState.tokens.length === 0) {
        return;
      }
      if (confirm("确定要删除这个账户吗？")) {
        window.AppState.tokens = window.AppState.tokens.filter(function (t, idx) {
          return idx != window.AppState.navIndex;
        });
        renderList();        
      }
    } else if (key === 'lock') {
      window.AppState.view = 'pin';
    } else if (key === 'quit') {
      window.close();
    }
  }
});

window.menu = menu
// dependency: lib/softkeys.js, lib/option-menu.js

// 初始化 OptionMenu ---
const menu = new OptionMenu({
  id: 'option-menu',
  items: [
    { label: '删除', key: 'delete' },
    { label: '锁定', key: 'lock' },
    { label: '退出应用', key: 'quit' }
  ],
  // 当菜单打开时，隐藏软键
  onOpen: () => {
    hideSoftkeys();
  },
  // 当菜单关闭时，恢复软键
  onClose: () => {
    showSoftkeys();
  },
  // 当选中某一项时
  onSelect: (key) => {
    console.log('菜单选中了:', key);
    if (key === 'delete') {
      alert('执行删除操作');
    } else if (key === 'lock') {
      window.AppState.view = 'pin';
    } else if (key === 'quit') {
      window.close();
    }
  }
});

window.menu = menu
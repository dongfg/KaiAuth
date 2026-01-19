class OptionMenu {
  constructor(config) {
    // config 包含: id (容器ID), items (菜单项数据), onSelect (回调), onClose (回调)
    this.container = document.getElementById(config.id);
    this.itemsData = config.items || [];
    this.onSelect = config.onSelect;
    this.onClose = config.onClose;
    this.onOpen = config.onOpen; // 可选：打开时的回调（用于改软键）

    this.selectedIndex = 0;
    this.isVisible = false;

    // 初始化渲染
    this.render();
  }

  // 渲染 HTML 结构
  render() {
    // 保持原本的 header/subheader 结构，动态生成 list
    const listContainer = this.container.querySelector('.menu-list');
    listContainer.innerHTML = ''; // 清空现有

    this.itemsData.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'menu-item';
      div.innerText = item.label;
      div.dataset.index = index;
      div.dataset.key = item.key; // 比如 'edit', 'delete'
      listContainer.appendChild(div);
    });

    this.menuItemsDom = this.container.querySelectorAll('.menu-item');
  }

  // 打开菜单
  open() {
    this.isVisible = true;
    this.selectedIndex = 0; // 重置光标
    this.container.classList.remove('hidden');
    this.updateFocus();
    if (this.onOpen) this.onOpen();
  }

  // 关闭菜单
  close() {
    this.isVisible = false;
    this.container.classList.add('hidden');
    if (this.onClose) this.onClose();
  }

  // 核心：处理菜单内的按键
  // 返回 true 表示按键被菜单消费了，不需要冒泡
  handleKey(key) {
    if (!this.isVisible) return false;

    switch (key) {
      case 'ArrowDown':
        if (this.selectedIndex < this.itemsData.length - 1) {
          this.selectedIndex++;
          this.updateFocus();
        }
        return true;

      case 'ArrowUp':
        if (this.selectedIndex > 0) {
          this.selectedIndex--;
          this.updateFocus();
        }
        return true;

      case 'Enter': // 确认
        const selectedItem = this.itemsData[this.selectedIndex];
        if (this.onSelect) {
          this.onSelect(selectedItem.key);
        }
        this.close();
        return true;

      case 'SoftRight':
      case 'Backspace': // 返回/关闭
        this.close();
        return true;

      default:
        return true; // 拦截其他按键，防止菜单打开时背景还在动
    }
  }

  // 更新高亮样式
  updateFocus() {
    this.menuItemsDom.forEach((el, idx) => {
      if (idx === this.selectedIndex) {
        el.classList.add('focused');
      } else {
        el.classList.remove('focused');
      }
    });
  }
}
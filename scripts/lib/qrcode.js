class QRCode {
  constructor() {
    this.element = this.createRootElement();
    this.interval = null;
    this.status = 'idle';
    this.handler = null;
  }

  readAsText() {
    if (this.status !== 'idle') {
      return Promise.reject(new Error('Already scanning for qr code'));
    }

    this.status = 'scanning';
    this.showViewer();

    // 改写为 Promise 链式调用
    return this.startVideo()
      .then(() => {
        return this.checkForQRCode();
      })
      .then((result) => {
        this.hideViewer();
        this.status = 'idle';
        return result; // 返回扫描结果或 null
      })
      .catch((err) => {
        this.hideViewer();
        this.status = 'idle';
        throw err; // 向上抛出错误
      });
  }

  handleKeyPress(ev) {
    if (ev.key !== 'SoftRight' && ev.key !== 'Backspace') {
      return;
    }
    ev.stopImmediatePropagation();
    ev.stopPropagation();
    ev.preventDefault();
    this.status = 'cancelled';
  }

  createRootElement() {
    const root = document.createElement('div');
    root.id = 'kosl__scanner';
    root.style.cssText = `
        position: absolute;
        top: 0; left: 0; bottom: 0; right: 0;
        z-index: 9999999;
        background: #000;
        color: rgba(255, 255, 255, .88);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    `;

    const header = document.createElement('header');
    header.style.cssText = 'font-weight: bold; text-align: center; padding-bottom: 5px;';
    header.textContent = 'Scan a QR Code';

    const video = document.createElement('video');
    video.style.cssText = 'flex: 1; min-height: 0;';

    const footer = document.createElement('footer');
    footer.style.cssText = 'font-weight: bold; text-align: right; padding: 5px 5px 0 5px;';
    footer.textContent = 'Cancel';

    root.appendChild(header);
    root.appendChild(video);
    root.appendChild(footer);

    return root;
  }

  showViewer() {
    document.body.appendChild(this.element);
    this.handler = this.handleKeyPress.bind(this);
    document.addEventListener('keydown', this.handler, { capture: true });
  }

  hideViewer() {
    document.removeEventListener('keydown', this.handler, { capture: true });
    if (this.interval) clearInterval(this.interval);
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
  }

  startVideo() {
    return new Promise((resolve, reject) => {
      // 兼容 KaiOS 的写法
      const getUserMedia = (navigator.mozGetUserMedia || navigator.getUserMedia || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)).bind(navigator);
      
      getUserMedia(
        {
          audio: false,
          video: { width: 240, height: 240 },
        },
        (stream) => {
          const video = this.element.querySelector('video');
          if (!video) return reject('Unable to find video element');
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play();
            resolve();
          };
        },
        reject
      );
    });
  }

  checkForQRCode() {
    return new Promise((resolve, reject) => {
      const video = this.element.querySelector('video');
      if (!video) return reject('Unable to find video element');

      const canvas = document.createElement('canvas');

      this.interval = setInterval(() => {
        if (this.status === 'cancelled') {
          return resolve(null);
        }

        if (video.videoWidth > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          // 假设全局存在 jsQR 库
          const code = jsQR(imageData.data, canvas.width, canvas.height);
          if (code) {
            resolve(code.data);
          }
        }
      }, 1000);
    });
  }
}
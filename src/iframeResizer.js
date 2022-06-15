addEventListener('message', function(e) {
  if (e.data && e.data.type === 'landscapeapp-resize') {
    document.querySelector('#landscape').style.height = e.data.height + 'px';
  }
  if (e.data && e.data.type === 'landscapeapp-show') {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    window.landscapeappModalIframe = iframe;
    const url = new URL(document.querySelector('#landscape').src);
    const search = url.search || '?a=a';
    let src = url.origin + url.pathname.replace('/pages/', '/pages-modal/') + search + '&selected=' + e.data.selected;
    if (src.indexOf('/pages-modal') === -1) {
      //support a version with ?embed=yes
      src = src + '&showmodal=yes'
    }
    iframe.src = src;
    iframe.style.position = 'fixed';
    iframe.style.left = 0;
    iframe.style.top = 0;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.zIndex = 10000;
    iframe.focus();
  }
  if (e.data && e.data.type === 'landscapeapp-hide') {
    const iframe = window.landscapeappModalIframe;
    if (iframe) {
      document.body.removeChild(iframe);
    }
  }
});

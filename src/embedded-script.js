// An embedded version of a script
const CncfLandscapeApp = {
  init: function() {
    setInterval(function() {
      window.parent.postMessage({
        type: 'landscapeapp-resize',
        height: document.body.scrollHeight
      }, '*');
    }, 1000);

    this.state = {};

    document.body.addEventListener('click', (e) => {
      const cardEl = e.target.closest('[data-id]');
      if (cardEl) {
        const selectedItemId = cardEl.getAttribute('data-id');
        this.showSelectedItem(selectedItemId);
      }
    });

    // support custom css styles and custom js eval code through iframe
    window.addEventListener('message', (event) => {
      var data = event.data;
      if (data.type === "css") {
        var styles = data.css;
        var el = document.createElement('style');
        el.type = 'text/css';
        if (el.styleSheet) {
          el.styleSheet.cssText = styles;
        } else {
          el.appendChild(document.createTextNode(styles));
        }
        document.getElementsByTagName("head")[0].appendChild(el);
      }
      if (data.type === "js") {
        eval(data.js);
      }
    });

    // support css styles via param
    const params = new URLSearchParams(window.location.search.substring(1));
    if (params.get('css')) {
      const element = document.createElement("link");
      element.setAttribute("rel", "stylesheet");
      element.setAttribute("type", "text/css");
      element.setAttribute("href", params.get('css'));
      document.getElementsByTagName("head")[0].appendChild(element);
    }
    if (params.get('style')) {
      const element = document.createElement("style");
      let style = params.get('style');
      try {
        style = JSON.parse(style)
      } catch(ex) {

      }
      element.innerHTML = style;
      document.getElementsByTagName("head")[0].appendChild(element);
    }
  },

  showSelectedItem: async function(selectedItemId) {
    window.parent.postMessage({
      type: 'landscapeapp-show',
      selected: selectedItemId,
      location: {
        search: window.location.search,
        pathname: window.location.pathname
      }
    }, '*');
  }
}
document.addEventListener('DOMContentLoaded', () => CncfLandscapeApp.init());

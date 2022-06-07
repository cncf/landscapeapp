// An embedded version of a script
const CncfLandscapeApp = {
  init: function() {
    // get initial state from the url
    this.state = {
      selected: new URLSearchParams(location.search).get('selected')
    };

    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) {
        if (CncfLandscapeApp.state.selected) {
          this.state.selected = null;
          this.hideSelectedItem();
        }
      }
    });

    document.body.addEventListener('click', (e) => {
      const modalBodyEl = e.target.closest('.modal-body');
      const shadowEl = e.target.closest('.modal-container');
      if (shadowEl && !modalBodyEl) {
        this.state.selected = null;
        this.hideSelectedItem();
        e.preventDefault();
        e.stopPropagation();
      }

      const modalClose = e.target.closest('.modal-close');
      if (modalClose) {
        this.state.selected = null;
        this.hideSelectedItem();
        e.preventDefault();
        e.stopPropagation();
      }

      const nextItem = e.target.closest('.modal-next');
      if (nextItem && CncfLandscapeApp.nextItemId) {
        CncfLandscapeApp.state.selected = CncfLandscapeApp.nextItemId;
        this.showSelectedItem(CncfLandscapeApp.state.selected);
        e.preventDefault();
        e.stopPropagation();
      }

      const prevItem = e.target.closest('.modal-prev');
      if (prevItem && CncfLandscapeApp.prevItemId) {
        CncfLandscapeApp.state.selected = CncfLandscapeApp.prevItemId;
        this.showSelectedItem(CncfLandscapeApp.state.selected);
        e.preventDefault();
        e.stopPropagation();
      }

      const selectedItemInternalLinkEl = e.target.closest('.modal-body a[data-type=internal]')
      if (selectedItemInternalLinkEl) {
        e.preventDefault();
        e.stopPropagation();
        return
      }

    }, false);

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
    this.showSelectedItem(this.state.selected);
  },

  showSelectedItem: async function(selectedItemId) {
    const allIdElements = document.querySelectorAll(`[data-id]`);
    let allIds = []
    for (let element of allIdElements) {
      allIds.push(element.getAttribute('data-id'));
    }
    this.selectedItems = this.selectedItems || {};
    if (!this.selectedItems[selectedItemId]) {
      const result = await fetch(`${this.basePath}/data/items/info-${selectedItemId}.html`);
      const text = await result.text();
      this.selectedItems[selectedItemId] = text;
    }
    document.querySelector('.modal').style.display="";
    document.querySelector('.modal .modal-content').outerHTML = this.selectedItems[selectedItemId];
    document.querySelector('body').style.overflow = 'hidden';

    if (window.twttr) {
      window.twttr.widgets.load();
    } else {
      setTimeout( () => window.twttr && window.twttr.widgets.load(), 1000);
    }

    //calculate previous and next items;
    const index = allIds.indexOf(selectedItemId);
    const prevItem = allIds[index - 1] || null;
    const nextItem = allIds[index + 1] || null;

    this.nextItemId = nextItem;
    this.prevItemId = prevItem;

    if (nextItem) {
      document.querySelector('.modal-next').removeAttribute('disabled');
    } else {
      document.querySelector('.modal-next').setAttribute('disabled', '');
    }

    if (prevItem) {
      document.querySelector('.modal-prev').removeAttribute('disabled');
    } else {
      document.querySelector('.modal-prev').setAttribute('disabled', '');
    }
  },

  hideSelectedItem: function() {
    window.parent.postMessage({type: 'landscapeapp-hide'}, '*');
  }
}
document.addEventListener('DOMContentLoaded', () => CncfLandscapeApp.init());

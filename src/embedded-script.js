// An embedded version of a script
const CncfLandscapeApp = {
  init: function() {
    // get initial state from the url
    setInterval(function() {
      document.body.style.height = document.querySelector('.column-content').scrollHeight;
    }, 1000);
    this.state = {
      selected: null
    }
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) {
        if (CncfLandscapeApp.state.selected) {
          this.state.selected = null;
          this.hideSelectedItem();
        }
      }
    });

    document.body.addEventListener('click', (e) => {
      const cardEl = e.target.closest('[data-id]');
      if (cardEl) {
        const selectedItemId = cardEl.getAttribute('data-id');
        CncfLandscapeApp.state.selected = selectedItemId;
        this.showSelectedItem(selectedItemId);
        e.preventDefault();
        e.stopPropagation();
      }

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
  },

  showSelectedItem: async function(selectedItemId) {
    this.selectedItems = this.selectedItems || {};
    if (!this.selectedItems[selectedItemId]) {
      const result = await fetch(`/data/items/info-${selectedItemId}.html`);
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
    let prevItem = null;
    let nextItem = null;
    if (true) {
      const selectedItemEl = document.querySelector(`[data-id=${selectedItemId}]`);
      const parent = selectedItemEl.closest('.cards-section');
      const allItems = parent.querySelectorAll('[data-id]');
      const index = [].indexOf.call(allItems, selectedItemEl);
      prevItem = index > 0 ? allItems[index - 1].getAttribute('data-id') : null;
      nextItem = index < allItems.length - 1 ? allItems[index + 1].getAttribute('data-id') : null;
    }

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

    if (window.parentIFrame) {
      window.parentIFrame.sendMessage({type: 'showModal'});
      window.parentIFrame.getPageInfo(function(info) {
        var offset = info.scrollTop - info.offsetTop;
        var maxHeight = info.clientHeight * 0.9;
        if (maxHeight > 640) {
          maxHeight = 640;
        }
        var defaultTop = (info.windowHeight - maxHeight) / 2;
        var top = defaultTop + offset;
        if (top < 0 && info.iframeHeight <= 600) {
          top = 10;
        }
        setTimeout(function() {
          const modal = document.querySelector('.modal-body');
          if (modal) {
            modal.style.top = top + 'px';
            modal.style.marginTop = 0;
            modal.style.marginBottom = 0;
            modal.style.bottom = '';
            modal.style.maxHeight = maxHeight + 'px';
          }
        }, 10);
      });
    }
  },
  hideSelectedItem: function() {
    document.querySelector('.modal').style.display="none";
    document.querySelector('body').style.overflow = '';
    if (window.parentIFrame) {
      window.parentIFrame.sendMessage({type: 'hideModal'})
    }
  }
}
document.addEventListener('DOMContentLoaded', () => CncfLandscapeApp.init());

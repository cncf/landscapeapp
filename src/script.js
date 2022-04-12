// This is a script which manages absolutely all interactions in a CNCF Landscape
// It should always have zero dependencies on any other script or module
const CncfLandscapeApp = {
  init: function() {
    CncfLandscapeApp.state = CncfLandscapeApp.parseUrl(window.location);

    if (CncfLandscapeApp.state.embed) {
      document.querySelector('html').classList.add('embed');
    }

    if (CncfLandscapeApp.state.mode === 'card') {
      CncfLandscapeApp.activateCardMode();
    }

    document.body.addEventListener('click', function(e) {
      const cardEl = e.target.closest('[data-id]');
      if (cardEl) {
        const selectedItemId = cardEl.getAttribute('data-id');
        CncfLandscapeApp.showSelectedItem(selectedItemId);
        e.preventDefault();
        e.stopPropagation();
      }

      const modalBodyEl = e.target.closest('.modal-body');
      const shadowEl = e.target.closest('.modal-container');
      if (shadowEl && !modalBodyEl) {
        CncfLandscapeApp.hideSelectedItem();
        e.preventDefault();
        e.stopPropagation();
      }

      const modalClose = e.target.closest('.modal-close');
      if (modalClose) {
        CncfLandscapeApp.hideSelectedItem();
        e.preventDefault();
        e.stopPropagation();
      }

      const nextItem = e.target.closest('.modal-next');
      if (nextItem && CncfLandscapeApp.nextItemId) {
        CncfLandscapeApp.showSelectedItem(CncfLandscapeApp.nextItemId);
        e.preventDefault();
        e.stopPropagation();
      }

      const prevItem = e.target.closest('.modal-prev');
      if (prevItem && CncfLandscapeApp.prevItemId) {
        CncfLandscapeApp.showSelectedItem(CncfLandscapeApp.prevItemId);
        e.preventDefault();
        e.stopPropagation();
      }

    }, false);

    // support custom css styles and custom js eval code through iframe
    window.addEventListener('message', function(event) {
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
  parseUrl: function({pathname, search }) {
    search = search || '';
    if (search.indexOf('?') === 0) {
      search = search.substring(1);
    }
    if (pathname.indexOf('/') === 0) {
      pathname = pathname.substring(1);
    }
    const params = new URLSearchParams(search);
    const mode = params.get('mode') || (pathname === '' ? 'main' : pathname);
    const grouping = params.get('grouping') || 'category';
    const sort = params.get('sort') || 'name';
    const filterCategory = params.get('category') || '';
    const filterRelation = params.get('project') || '';
    const filterLicense = params.get('license') || '';
    const filterOrganization = params.get('organization') || '';
    const filterHeadquarters = params.get('headquarters') || '';
    const filterCompanyType = params.get('company-type') || '';
    const filterIndustries = params.get('filter-industries') || '';
    const filterBestPractices = params.get('bestpractices') || '';
    const filterEndUser = params.get('enduser') || '';
    const filterLanguage = params.get('language') || '';
    const selected = params.get('selected') || '';
    const embed = params.has('embed');
    return {
      mode,
      grouping,
      sort,
      selected,
      embed,
      filterCategory,
      filterRelation,
      filterLicense,
      filterOrganization,
      filterHeadquarters,
      filterCompanyType,
      filterIndustries,
      filterBestPractices,
      filterEndUser,
      filterLanguage
    }
  },
  showSelectedItem: async function(selectedItemId) {
    this.state.selectedItemId = selectedItemId;
    this.selectedItems = this.selectedItems || {};
    if (!this.selectedItems[selectedItemId]) {
      const result = await fetch(`/data/items/info-${selectedItemId}.html`);
      const text = await result.text();
      this.selectedItems[selectedItemId] = text;
      this.showSelectedItem(selectedItemId);
      return;
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
    if (this.state.mode === 'main') {
      const items = this.groupedItems.flatMap( (x) => x.items);
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === selectedItemId) {
          prevItem = (items[i - 1] || {}).id;
          nextItem = (items[i + 1] || {}).id;
          break;
        }
      }
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

  },
  hideSelectedItem: function() {
    this.state.selectedItemId = null;
    document.querySelector('.modal').style.display="none";
    document.querySelector('body').style.overflow = '';
  },
  fetchApiData: async function() {
    const params = '';
    const response = await fetch(`/api/items?${params}`);
    const json = await response.json();
    this.groupedItems = json;
  },
  activateCardMode: async function() {

    const cardStyle = 'card';
    CncfLandscapeApp.state.mode = 'card';

    document.querySelector('.landscape-flex').style.display="none";
    document.querySelector('.column-content').style.display="";

    if (!this.cards) {
      const response = await fetch(`/data/items/cards-${cardStyle}.html`);
      const allCards = await response.text();
      const container = document.createElement('div');
      container.innerHTML = allCards;
      const cardElements = container.querySelectorAll('[data-id]');
      let result = {};
      for (let card of cardElements) {
        result[card.getAttribute('data-id')] = card;
      }
      this.cards = result;
      this.activateCardMode();
    } else {
      if (!this.groupedItems) {
        await this.fetchApiData();
        this.activateCardMode();
      } else {
      // if we have groupedItems
      const itemsAndHeaders = this.groupedItems.flatMap(groupedItem => {
        const items = groupedItem.items;
        const cardElements = items.map( (item) => this.cards[item.id].cloneNode(true))
        const buildHeader = function({ header, count, href }) {
          const div = document.createElement('div');
          div.classList.add('sh_wrapper');
          div.innerHTML = `
      <div style="font-size: 24px; padding-left: 16px; line-height: 48px; font-weight: 500;">
        ${ href ? `<a href=${href}>${header}</a>` : `<span>${header}</span>` }
        <span class="items-cont">(${count})</span>
      </div>
  `;
          return div;
        };
        const header = items.length > 0 ? buildHeader({
          header: groupedItem.header,
          count: groupedItem.items.length,
          href: groupedItem.href}) : null;
        return [ header, ...cardElements];
      });
      const fragment = document.createDocumentFragment();
      for (let item of itemsAndHeaders) {
        if (item) {
          fragment.appendChild(item);
        }
      }
      document.querySelector('.column-content').replaceChildren(fragment);
      }
    }
  }
};
document.addEventListener('DOMContentLoaded', () => CncfLandscapeApp.init());

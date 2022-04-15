// This is a script which manages absolutely all interactions in a CNCF Landscape
// It should always have zero dependencies on any other script or module
const CncfLandscapeApp = {
  init: function() {
    // get initial state from the url
    CncfLandscapeApp.state = CncfLandscapeApp.parseUrl(window.location);

    this.manageZoomAndFullscreenButtons();

    if (CncfLandscapeApp.state.embed) {
      document.querySelector('html').classList.add('embed');
    }

    if (CncfLandscapeApp.state.mode === 'card') {
      CncfLandscapeApp.activateCardMode();
    } else if (CncfLandscapeApp.state.mode === 'guide') {
      CncfLandscapeApp.activateGuideMode();
    } else {
      CncfLandscapeApp.activateBigPictureMode(CncfLandscapeApp.state.mode);
    }

    document.addEventListener('keydown', function(e) {
      if (e.keyCode === 27) {
        if (CncfLandscapeApp.state.selectedItemId) {
          CncfLandscapeApp.hideSelectedItem();
        } else if (CncfLandscapeApp.state.fullscreen) {
          CncfLandscapeApp.state.fullscreen = false;
          CncfLandscapeApp.manageZoomAndFullscreenButtons();
        }
      }
    });

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

      const tabItem = e.target.closest('a[data-mode]');
      if (tabItem) {
        const mode = tabItem.getAttribute('data-mode');
        if (mode === 'card') {
          CncfLandscapeApp.activateCardMode()
        } else {
          CncfLandscapeApp.activateBigPictureMode(mode);
        }

        e.preventDefault();
        e.stopPropagation();
      }

      const guideEl = e.target.closest('#home .guide-toggle a');
      if (guideEl)  {
        CncfLandscapeApp.activateGuideMode();
        e.preventDefault();
        e.stopPropagation();
      }

      const mainEl = e.target.closest('#guide-page .guide-toggle a');
      if (mainEl)  {
        CncfLandscapeApp.activateCardMode();
        e.preventDefault();
        e.stopPropagation();
      }

      const guideNavigationEl = e.target.closest('#guide-page .guide-sidebar a');
      if (guideNavigationEl) {
        CncfLandscapeApp.selectGuideSection(guideNavigationEl);
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
  selectGuideSection: function(guideNavigationEl) {
    const allLinks = [...document.querySelectorAll('#guide-page .guide-sidebar a[data-level]')];
    guideNavigationEl = guideNavigationEl || document.querySelector('#guide-page .guide-sidebar a.active') || allLinks[0];
    const linkLevel = guideNavigationEl.getAttribute('data-level');
    const index = allLinks.indexOf(guideNavigationEl);
    let parentIndex = index;
    const selectedLinkLevel = linkLevel;
    if (linkLevel === "2") {
      for (let i = index - 1; i >= 0; i -= 1) {
        const prevLink = allLinks[i];
        if (prevLink.getAttribute('data-level') === "1") {
          parentIndex = i;
          break;
        }
      }
    }
    const hasChildren = linkLevel === "2" || allLinks[index + 1] && allLinks[index + 1].getAttribute('data-level') === "2";
    let childrenStarted = false;
    for (let i = 0; i < allLinks.length; i++) {
      const link = allLinks[i];
      const linkLevel = link.getAttribute('data-level');
      if (linkLevel === "2" && i === parentIndex + 1) {
        childrenStarted = true;
      }
      if (childrenStarted && linkLevel === "1") {
        childrenStarted = false;
      }
      link.classList.remove('expanded');
      link.classList.remove('active');
      if (hasChildren && selectedLinkLevel === "1" && i === index + 1) {
        link.classList.add('active')
      }
      if (hasChildren && selectedLinkLevel === "2" && i === index) {
        link.classList.add('active')
      }
      if (!hasChildren && i === index) {
        link.classList.add('active')
      }
      if (hasChildren && i === parentIndex) {
        link.classList.add('expanded');
      }
      if (linkLevel === "2") {
        if (childrenStarted) {
          link.classList.remove('display-hidden');
        } else {
          link.classList.add('display-hidden');
        }
      }
    }

  },
  // everything related to zoom
  manageZoomAndFullscreenButtons: function() {
    const zoomLevels = [0.4, 0.6, 0.8, 1.0, 1.2, 1.5, 2.0, 2.5, 4.0];
    const zoomLevelsReverse = [...zoomLevels].reverse();
    if (this.state.fullscreen) {
      document.querySelector('html').classList.add('fullscreen');
    } else {
      document.querySelector('html').classList.remove('fullscreen');
    }

    document.querySelector('.right-buttons').style.display = this.state.mode === 'card' ? 'none' : '';
    document.querySelector('.right-buttons .fullscreen-exit').style.display = this.state.fullscreen ? '' : 'none';
    document.querySelector('.right-buttons .fullscreen-enter').style.display = !this.state.fullscreen ? '' : 'none';
    document.querySelector('.right-buttons .zoom-reset').innerText = (this.state.zoom * 100) + '%';

    for (let landscapeEl of document.querySelectorAll('.inner-landscape')) {
      landscapeEl.style.transform = `scale(${this.state.zoom})`;
    }
    const nextZoomOut = zoomLevelsReverse.find( (x) => x < this.state.zoom);
    const nextZoomIn = zoomLevels.find( (x) => x > this.state.zoom);
    const zoomOutEl = document.querySelector('.right-buttons .zoom-out');
    const zoomInEl = document.querySelector('.right-buttons .zoom-in');
    if (nextZoomOut) {
      zoomOutEl.classList.remove('disabled');
    } else {
      zoomOutEl.classList.add('disabled');
    }
    if (nextZoomIn) {
      zoomInEl.classList.remove('disabled');
    } else {
      zoomInEl.classList.add('disabled');
    }

    // manage all related events
    if (!this.zoomAndFullscreenListenersAttached) {
      this.zoomAndFullscreenListenersAttached = true;

      document.querySelector('.right-buttons').addEventListener('click', (e) => {
        const zoomIn = e.target.closest('.zoom-in');
        if (zoomIn) {
          const nextZoomIn = zoomLevels.find( (x) => x > this.state.zoom);
          if (nextZoomIn) {
            this.state.zoom = nextZoomIn;
            this.manageZoomAndFullscreenButtons();
          }
        }
        const zoomOut = e.target.closest('.zoom-out');
        if (zoomOut) {
          const nextZoomOut = zoomLevelsReverse.find( (x) => x < this.state.zoom);
          if (nextZoomOut) {
            this.state.zoom = nextZoomOut;
            this.manageZoomAndFullscreenButtons();
          }
        }
        const fullscreenEnter = e.target.closest('.fullscreen-enter');
        if (fullscreenEnter) {
          this.state.fullscreen = true;
          this.manageZoomAndFullscreenButtons();
        }
        const fullscreenExit = e.target.closest('.fullscreen-exit');
        if (fullscreenExit) {
          this.state.fullscreen = false;
          this.manageZoomAndFullscreenButtons();
        }
        const zoomReset = e.target.closest('.zoom-reset');
        if (zoomReset) {
          this.state.zoom = 1;
          this.manageZoomAndFullscreenButtons();
        }
      }, false);
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
    return {
      zoom: +params.get('zoom') || 1,
      fullscreen: params.get('fullscreen') === 'yes',
      mode: params.get('mode') || (pathname === '' ? 'main' : pathname),
      grouping: params.get('grouping') || 'category',
      sort: params.get('sort') || 'name',
      filterCategory: params.get('category') || '',
      filterRelation: params.get('project') || '',
      filterLicense: params.get('license') || '',
      filterOrganization: params.get('organization') || '',
      filterHeadquarters: params.get('headquarters') || '',
      filterCompanyType: params.get('company-type') || '',
      filterIndustries: params.get('filter-industries') || '',
      filterBestPractices: params.get('bestpractices') || '',
      filterEndUser: params.get('enduser') || '',
      filterLanguage: params.get('language') || '',
      selected: params.get('selected') || '',
      embed: params.has('embed'),
    };
  },
  stringifyApiUrl: function(state) {



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
    if (this.state.mode === 'card') {
      const items = this.groupedItems.flatMap( (x) => x.items);
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === selectedItemId) {
          prevItem = (items[i - 1] || {}).id;
          nextItem = (items[i + 1] || {}).id;
          break;
        }
      }
    } else {
      const selectedItemEl = document.querySelector(`.inner-landscape [data-id=${selectedItemId}]`);
      const parent = selectedItemEl.closest('.big-picture-section');
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

  },
  hideSelectedItem: function() {
    this.state.selectedItemId = null;
    document.querySelector('.modal').style.display="none";
    document.querySelector('body').style.overflow = '';
  },
  fetchApiData: async function() {
    const params = {};
    const state = this.state;
    params.grouping = state.mode === 'card' ? state.grouping : 'no';
    params.category = state.mode === 'category' ? state.filterCategory : '';
    params.project = state.filterRelation;
    params.license = state.filterLicense;
    params.organization = state.filterOrganization;
    params.headquarters = state.filterHeadquarters;
    params['company-type'] = state.filterCompanyType;
    params['filter-industries'] = state.filterIndustries;
    params['bestpractices'] = state.filterBestPractices;
    params['enduser'] = state.filterEndUser;
    params['language'] = state.filterLanguage;

    const search = new URLSearchParams(params).toString();
    const url = `api/items?${search}`;
    const response = await fetch(url);
    const json = await response.json();
    return json;
  },
  highlightActiveTab: function() {
    const tabs = document.querySelectorAll('.big-picture-switch a[data-mode]');
    for (let tab of tabs) {
      if (tab.getAttribute('data-mode') === CncfLandscapeApp.state.mode) {
        tab.classList.add('selected');
      } else {
        tab.classList.remove('selected');
      }
    }
  },

  activateGuideMode: async function() {
    CncfLandscapeApp.state.mode = 'guide';

    document.querySelector('#home').style.display = "none";
    document.querySelector('#guide-page').style.display = "";

    const contentEl = document.querySelector('#guide-page');
    if (!contentEl.getAttribute('data-loaded')) {
      const url = `data/items/guide.html`;
      const result = await fetch(url);
      const text = await result.text();
      contentEl.innerHTML = text;
      contentEl.setAttribute('data-loaded', true);
    }
    CncfLandscapeApp.selectGuideSection();
  },

  activateBigPictureMode: async function(landscape) {
    CncfLandscapeApp.state.mode = landscape;

    document.querySelector('#home').style.display = "";
    document.querySelector('#guide-page').style.display = "none";

    document.querySelector('.column-content').style.display="none";
    document.querySelector('#footer').style.display = "none"
    document.querySelector('#embedded-footer').style.display = "none"

    // visibility
    const landscapes = document.querySelectorAll('.landscape-flex');
    for (let l of landscapes) {
      l.style.display = l.getAttribute('data-mode') === landscape ? '' : 'none';
    }
    this.highlightActiveTab();
    this.manageZoomAndFullscreenButtons();

    const bigPictureItems = await this.fetchApiData();
    console.info(bigPictureItems);

    const contentEl = document.querySelector(`.landscape-flex[data-mode=${landscape}]`);
    if (contentEl.querySelector('.inner-landscape').children.length === 0) {
      const tabEl = document.querySelector(`a[data-mode=${landscape}]`);
      const url = `data/items/landscape-${tabEl.getAttribute('href')}.html`
      const result = await fetch(url);
      const text = await result.text();
      contentEl.querySelector('.inner-landscape').innerHTML = text;
    }


  },
  activateCardMode: async function() {
    const cardStyle = 'card';
    CncfLandscapeApp.state.mode = 'card';

    document.querySelector('#home').style.display = "";
    document.querySelector('#guide-page').style.display = "none";

    const landscapes = document.querySelectorAll('.landscape-flex');
    for (let l of landscapes) {
      l.style.display = "none";
    }
    document.querySelector('.column-content').style.display= "";

    const isEmbed = this.state.embed;
    document.querySelector('#footer').style.display = isEmbed ? "none" : "";
    document.querySelector('#embedded-footer').style.display = isEmbed ? "" : "none";
    this.highlightActiveTab();
    this.manageZoomAndFullscreenButtons();

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
    }

    if (!this.groupedItems) {
        this.groupedItems = await this.fetchApiData();
    }
        // very simple optimization:
        // do not change anything if we used exactly same groupedItems last time;
    if (JSON.stringify(this.groupedItems) === this.lastCards) {
      return;
    }

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
    this.lastCards = JSON.stringify(this.groupedItems);
  }
}
document.addEventListener('DOMContentLoaded', () => CncfLandscapeApp.init());

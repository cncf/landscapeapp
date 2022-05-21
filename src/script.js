// This is a script which manages absolutely all interactions in a CNCF Landscape
// It should always have zero dependencies on any other script or module
const CncfLandscapeApp = {
  init: function() {
    // get initial state from the url
    this.filterProps = '';
    CncfLandscapeApp.state = CncfLandscapeApp.parseUrl(window.location);
    CncfLandscapeApp.initialState = {
      ...CncfLandscapeApp.parseUrl({pathname: '', search: ''}),
      mode: CncfLandscapeApp.initialMode
    };

    this.manageZoomAndFullscreenButtons();

    if (CncfLandscapeApp.state.embed) {
      document.querySelector('html').classList.add('embed');
      setInterval(function() {
        document.body.style.height = document.querySelector('.column-content').scrollHeight;
      }, 1000);
      document.querySelector('#embedded-footer a').href = this.stringifyBrowserUrl({...this.state, embed: false});
    }
    if (CncfLandscapeApp.state.cardStyle === 'borderless') {
      document.querySelector('html').classList.add('borderless-mode');
    }
    if (CncfLandscapeApp.state.cardStyle === 'flat') {
      document.querySelector('html').classList.add('flat-mode');
    }
    if (CncfLandscapeApp.state.cardStyle === 'logo') {
      document.querySelector('html').classList.add('logo-mode');
    }

    this.propagateStateToUiAndUrl();

    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) {
        if (CncfLandscapeApp.state.selected) {
          this.state.selected = null;
          this.propagateStateToUiAndUrl();
        } else if (CncfLandscapeApp.state.fullscreen) {
          CncfLandscapeApp.state.fullscreen = false;
          CncfLandscapeApp.manageZoomAndFullscreenButtons();
        } else if (document.querySelector('.select-popup').style.display === '') {
          document.querySelector('.select-popup').style.display = "none";
        }
      }
    });

    document.body.addEventListener('click', (e) => {
      const cardEl = e.target.closest('[data-id]');
      if (cardEl) {
        const selectedItemId = cardEl.getAttribute('data-id');
        CncfLandscapeApp.state.selected = selectedItemId;
        this.propagateStateToUiAndUrl();
        e.preventDefault();
        e.stopPropagation();
      }

      const modalBodyEl = e.target.closest('.modal-body');
      const shadowEl = e.target.closest('.modal-container');
      if (shadowEl && !modalBodyEl) {
        this.state.selected = null;
        this.propagateStateToUiAndUrl();
        e.preventDefault();
        e.stopPropagation();
      }

      const modalClose = e.target.closest('.modal-close');
      if (modalClose) {
        this.state.selected = null;
        this.propagateStateToUiAndUrl();
        e.preventDefault();
        e.stopPropagation();
      }

      const nextItem = e.target.closest('.modal-next');
      if (nextItem && CncfLandscapeApp.nextItemId) {
        CncfLandscapeApp.state.selected = CncfLandscapeApp.nextItemId;
        this.propagateStateToUiAndUrl();
        e.preventDefault();
        e.stopPropagation();
      }

      const prevItem = e.target.closest('.modal-prev');
      if (prevItem && CncfLandscapeApp.prevItemId) {
        CncfLandscapeApp.state.selected = CncfLandscapeApp.prevItemId;
        this.propagateStateToUiAndUrl();
        e.preventDefault();
        e.stopPropagation();
      }

      const tabItem = e.target.closest('a[data-mode]');
      if (tabItem) {
        CncfLandscapeApp.state.mode = tabItem.getAttribute('data-mode');
        CncfLandscapeApp.propagateStateToUiAndUrl();
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
        CncfLandscapeApp.guideScrollTop = document.body.scrollTop;
        CncfLandscapeApp.state.mode = CncfLandscapeApp.previousMode || 'main';
        CncfLandscapeApp.propagateStateToUiAndUrl();
        e.preventDefault();
        e.stopPropagation();
      }

      const guideNavigationEl = e.target.closest('#guide-page .guide-sidebar a[data-level]');
      if (guideNavigationEl) {
        CncfLandscapeApp.selectGuideSection(guideNavigationEl);
        document.querySelector('#guide-page').classList.remove('sidebar-open');
      }

      const selectPopupItemEl = e.target.closest('.select-popup-body div');
      const selectPopupShadowEl = e.target.closest('.select-popup');
      if (selectPopupShadowEl && !selectPopupItemEl) {
        selectPopupShadowEl.style.display = "none";
      }

      if (selectPopupItemEl) {
        CncfLandscapeApp.handlePopupItemClick(selectPopupItemEl);
        e.preventDefault();
        e.stopPropagation();
      }

      const presetEl = e.target.closest('.sidebar-presets a');
      if (presetEl) {
        e.preventDefault();
        e.stopPropagation();
        let href = presetEl.getAttribute('href');
        let pathname;
        let search;
        if (href.indexOf('?') === -1) {
          pathname = '/';
          search = href.replace('/', '');
        } else {
          [pathname, search] = href.split('?');
        }
        const newState = CncfLandscapeApp.parseUrl({pathname, search});
        CncfLandscapeApp.state = newState;
        CncfLandscapeApp.propagateStateToUiAndUrl();
      }

      const groupingInternalLinkEl = e.target.closest('.sh_wrapper a[data-type=internal]');
      if (groupingInternalLinkEl) {
        e.preventDefault();
        e.stopPropagation();
        if (CncfLandscapeApp.state.embed) {
          return;
        }
        const newState = {...CncfLandscapeApp.state };
        const linkState = this.parseUrl({search: groupingInternalLinkEl.getAttribute('href'), pathname: '', hash: ''});

        const f = (name, x) => this.calculateFullSelection(name, x);
        const allowedProps = ['grouping', 'sort', 'bestpractices', 'enduser', 'parent', 'language'];
        const otherProps = ['category', 'project', 'license', 'organization', 'headquarters', 'company-type', 'industries']
        for (let key of allowedProps) {
          newState[key] = linkState[key] || CncfLandscapeApp.initialState[key];
        }
        for (let key of otherProps) {
          newState[key] = f(key, linkState[key] || CncfLandscapeApp.initialState[key]);
        }

        CncfLandscapeApp.state = newState;
        CncfLandscapeApp.propagateStateToUiAndUrl();
      }
      const selectedItemInternalLinkEl = e.target.closest('.modal-body a[data-type=internal]')
      if (selectedItemInternalLinkEl) {
        e.preventDefault();
        e.stopPropagation();
        if (CncfLandscapeApp.state.embed) {
          return;
        }
        const newState = {...CncfLandscapeApp.state };
        const linkState = this.parseUrl({search: selectedItemInternalLinkEl.getAttribute('href'), pathname: '', hash: ''});
        // Hide dialog, switch to a card mode
        newState.selected = null;
        newState.mode = 'card';

        // Only set certain properties: filterable + invisible filters
        // for visible filter we need to always expand a current selection
        const f = (name, x) => this.calculateFullSelection(name, x);
        const allowedProps = ['grouping', 'sort', 'bestpractices', 'enduser', 'parent', 'language'];
        const otherProps = ['category', 'project', 'license', 'organization', 'headquarters', 'company-type', 'industries']
        for (let key of allowedProps) {
          newState[key] = linkState[key] || CncfLandscapeApp.initialState[key];
        }
        for (let key of otherProps) {
          newState[key] = f(key, linkState[key] || CncfLandscapeApp.initialState[key]);
        }

        CncfLandscapeApp.state = newState;
        CncfLandscapeApp.propagateStateToUiAndUrl();
      }

      const categoryLink = e.target.closest('.inner-landscape a[data-type=internal]');
      if (categoryLink) {
        e.preventDefault();
        e.stopPropagation();
        const newState = {...CncfLandscapeApp.state };
        const linkState = this.parseUrl({search: categoryLink.getAttribute('href'), pathname: '', hash: ''});
        // Hide dialog, switch to a card mode
        newState.mode = 'card';
        newState.category = linkState.category;
        newState.grouping = 'category';

        CncfLandscapeApp.state = newState;
        CncfLandscapeApp.propagateStateToUiAndUrl();
      }

      const otherLandscapeLink = e.target.closest('.inner-landscape a[data-type=tab]');
      if (otherLandscapeLink) {
        e.preventDefault();
        e.stopPropagation();
        const tab = otherLandscapeLink.getAttribute('href').split('/').slice(-1)[0] || "main";
        this.activateBigPictureMode(tab);
      }

      const expandFilters = e.target.closest('#home .sidebar-show');
      if (expandFilters) {
        document.querySelector('#home').classList.add('filters-opened');
      }

      const collapseFilters = e.target.closest('#home .sidebar-collapse');
      if (collapseFilters) {
        document.querySelector('#home').classList.remove('filters-opened');
      }

      const appOverlay = e.target.closest('#home .app-overlay');
      if (appOverlay) {
        document.querySelector('#home').classList.remove('filters-opened');
      }

      const expandGuideFilters = e.target.closest('#guide-page .sidebar-show');
      if (expandGuideFilters) {
        document.querySelector('#guide-page').classList.add('sidebar-open');
      }

      const closeGuideFilters = e.target.closest('#guide-page .sidebar-collapse');
      if (closeGuideFilters) {
        document.querySelector('#guide-page').classList.remove('sidebar-open');
      }

      const resetAllEl = e.target.closest('#home .landscape-logo a');
      if (resetAllEl) {
        e.preventDefault();
        e.stopPropagation();
        CncfLandscapeApp.state = {...CncfLandscapeApp.initialState};
        CncfLandscapeApp.propagateStateToUiAndUrl();
      }

      const resetFiltersEl = e.target.closest('.sidebar .reset-filters');
      if (resetFiltersEl) {
        e.preventDefault();
        e.stopPropagation();

        const newState = {...CncfLandscapeApp.state };

        const f = (name, x) => this.calculateFullSelection(name, x);
        const allowedProps = ['bestpractices', 'enduser', 'parent', 'language'];
        const otherProps = ['category', 'project', 'license', 'organization', 'headquarters', 'company-type', 'industries']
        for (let key of allowedProps) {
          newState[key] = CncfLandscapeApp.initialState[key];
        }
        for (let key of otherProps) {
          newState[key] = f(key, CncfLandscapeApp.initialState[key]);
        }

        CncfLandscapeApp.state = newState;
        CncfLandscapeApp.propagateStateToUiAndUrl();
      }

      const exportEl = e.target.closest('.sidebar .export');
      if (exportEl) {
        e.preventDefault();
        e.stopPropagation();
        const search = CncfLandscapeApp.stringifyApiUrl();
        const url = `${this.basePath}/api/export?${search}`;

        // now open a download
        const link = document.createElement('a');
        link.style.display = "none";
        link.href = url;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }


    }, false);

    document.addEventListener('mousedown', (e) => {
      const selectEl = e.target.closest('select');
      if (selectEl) {
        e.preventDefault();
        e.stopPropagation();
        CncfLandscapeApp.openSelectPopup(selectEl);
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
    window.addEventListener('popstate', (e) => {
      if (e.state) {
        CncfLandscapeApp.state = e.state;
        CncfLandscapeApp.propagateStateToUi();
      }
    });

    document.body.style.opacity = 1;
  },

  selectGuideSection: function(guideNavigationEl) {
    const allLinks = [...document.querySelectorAll('#guide-page .guide-sidebar a[data-level]')];
    if (!guideNavigationEl) {
      guideNavigationEl = allLinks.find( (x) => x.getAttribute('href') === this.state.activeSection);
    }
    if (!guideNavigationEl) {
      for (let i = 0; i < allLinks.length; i++) {
        const link = allLinks[i];
        const linkLevel = link.getAttribute('data-level');
        link.classList.remove('expanded');
        link.classList.remove('active');
        if (linkLevel === "2") {
          link.classList.add('display-hidden');
        }
      }
      return;
    }

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
    this.state.activeSection = guideNavigationEl.getAttribute('href');
    if (!this.hadGuideNavigation) {
      this.hadGuideNavigation = true;
      document.querySelector(this.state.activeSection).scrollIntoView();
    }
    if (this.guideScrollTop) {
      document.body.scrollTop = this.guideScrollTop;
    }

  },

  openSelectPopup: function(selectEl) {
    const wrapperEl = selectEl.closest('[data-name]');
    let items = [];
    if (wrapperEl.getAttribute('data-options')) {
      items = JSON.parse(wrapperEl.getAttribute('data-options'));
    }
    const kind = wrapperEl.getAttribute('data-type');
    let content;
    let firstSelected = null;
    if (kind === 'single') {
      const currentValue = wrapperEl.getAttribute('data-value');
      firstSelected = currentValue;
      content = items.map( (item) => `
        <div data-option-id="${item.id}" ${item.id === currentValue ? "class=active" : ""}>${item.label}</div>
      `).join('');
    } else {
      const currentValues = (wrapperEl.getAttribute('data-value') || '').split(',');
      firstSelected = currentValues[0];
      content = items.map( (item) => {
        const isActive = currentValues.includes(item.id);
        return `
        <div data-option-id="${item.id}" data-level=${item.level} ${isActive ? "class=active" : ""}>
          <label class="pure-material-checkbox">
            <input type="checkbox" ${isActive ? " checked " : ""}>
            <span>${item.label}</span>
          </label>
        </div>
       `
      }).join('');
    }

    const popupRoot = document.querySelector('.select-popup');
    const popupBody = document.querySelector('.select-popup-body');
    const box = selectEl.getBoundingClientRect();
    popupBody.setAttribute('data-name', wrapperEl.getAttribute('data-name'));
    popupBody.setAttribute('data-type', wrapperEl.getAttribute('data-type'));
    popupBody.innerHTML = content;
    popupRoot.style.display = "";
    popupBody.style.left = box.left + "px";
    const realHeight = items.length * 26 + 10;
    const maxHeight = document.body.clientHeight - 20;
    const height = Math.min(maxHeight, realHeight);
    const top = Math.min(box.top, document.body.clientHeight - 10 - height);

    popupBody.style.top = top + "px";
    popupBody.style.height = height + "px";
    if (firstSelected) {
      const itemEl = popupBody.querySelector(`[data-option-id=${firstSelected}]`);
      itemEl.scrollIntoView();
    }
  },

  handlePopupItemClick(itemEl) {
    const popupBody = document.querySelector('.select-popup-body');
    const popupRoot = document.querySelector('.select-popup');
    const mode = popupBody.getAttribute('data-type');
    const optionId = itemEl.getAttribute('data-option-id');
    const wrapper = document.querySelector(`.select[data-name=${popupBody.getAttribute('data-name')}`);
    const name = wrapper.getAttribute('data-name');
    if (mode === 'single') {
      popupRoot.style.display = "none";
      CncfLandscapeApp.state[name] = optionId;
      CncfLandscapeApp.propagateStateToUiAndUrl();
    } else {
      // toggle
      const isItemSelected = itemEl.querySelector('input').checked;
      const newValue = !isItemSelected;
      itemEl.querySelector('input').checked = newValue;
      itemEl.classList.remove('active');
      if (newValue) {
        itemEl.classList.add('active');
      }
      //now recalculate parent
      const allItems = [...popupBody.querySelectorAll('div')];
      const currentIndex = allItems.indexOf(itemEl);
      if (itemEl.getAttribute('data-level') === "1") {
        for (let i = currentIndex + 1; i < allItems.length; i++) {
          const childEl = allItems[i];
          if (childEl.getAttribute('data-level') === "1") {
            break;
          }
          childEl.querySelector('input').checked = newValue;
          childEl.classList.remove('active');
          if (newValue) {
            childEl.classList.add('active');
          }
        }
      } else {
        // or recalculate children
        let parentIndex = null;
        for (let i = currentIndex - 1; i >=0; i -= 1) {
          if (allItems[i].getAttribute('data-level') === "1") {
            parentIndex = i;
            break;
          }
        }
        let hasTrue = false;
        let hasChildren = false;
        let children = [];
        for (let i = parentIndex + 1; i < allItems.length; i++) {
          const childEl = allItems[i];
          if (childEl.getAttribute('data-level') === "1") {
            break;
          }
          hasChildren = true;
          const value = childEl.classList.contains('active');
          if (value) {
            hasTrue = true;
          }
        }
        if (hasChildren && hasTrue) {
            allItems[parentIndex].querySelector('input').checked = true;
            allItems[parentIndex].classList.add('active');
        } else if (hasChildren && !hasTrue) {
            allItems[parentIndex].querySelector('input').checked = false;
            allItems[parentIndex].classList.remove('active');
        }
      }

      const selected = allItems.filter( (x) => x.classList.contains('active'));
      const selectedIds = selected.map( (x) => x.getAttribute('data-option-id'));
      CncfLandscapeApp.state[name] = selectedIds.join(',');
      CncfLandscapeApp.propagateStateToUiAndUrl();
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
            this.updateUrl();
          }
        }
        const zoomOut = e.target.closest('.zoom-out');
        if (zoomOut) {
          const nextZoomOut = zoomLevelsReverse.find( (x) => x < this.state.zoom);
          if (nextZoomOut) {
            this.state.zoom = nextZoomOut;
            this.manageZoomAndFullscreenButtons();
            this.updateUrl();
          }
        }
        const fullscreenEnter = e.target.closest('.fullscreen-enter');
        if (fullscreenEnter) {
          this.state.fullscreen = true;
          this.manageZoomAndFullscreenButtons();
          this.updateUrl();
        }
        const fullscreenExit = e.target.closest('.fullscreen-exit');
        if (fullscreenExit) {
          this.state.fullscreen = false;
          this.manageZoomAndFullscreenButtons();
          this.updateUrl();
        }
        const zoomReset = e.target.closest('.zoom-reset');
        if (zoomReset) {
          this.state.zoom = 1;
          this.manageZoomAndFullscreenButtons();
          this.updateUrl();
        }
      }, false);
    }
  },
  parseUrl: function({pathname, search, hash }) {
    search = search || '';
    pathname = pathname.replace(this.basePath, '');
    if (search.indexOf('?') !== -1) {
      search = search.split('?')[1];
    }
    if (pathname.indexOf('/') === 0) {
      pathname = pathname.substring(1);
    }
    const params = new URLSearchParams(search);
    const f = (name, x) => this.calculateFullSelection(name, x);

    const parseMode = (x) => (x || '').indexOf('-mode') !== -1 ? 'card' : (x || CncfLandscapeApp.initialMode);
    const parseCardStyle = (x) => (x || '').indexOf('-mode') !== -1 ? x.replace('-mode', '') : 'card';

    return {
      zoom: +params.get('zoom') / 100 || 1,
      fullscreen: params.get('fullscreen') === 'yes',

      activeSection: hash,

      mode: parseMode(params.get('format') || pathname) || CncfLandscapeApp.initialMode,
      cardStyle: params.get('style') || parseCardStyle(pathname),

      grouping: params.get('grouping') || 'project',
      sort: params.get('sort') || 'name',

      category: f('category', params.get('category') || ''),
      project: f('project', params.get('project') || ''),
      license: f('license', params.get('license') || ''),
      organization: f('organization', params.get('organization') || ''),
      headquarters: f('headquarters', params.get('headquarters') || ''),
      ['company-type']: f('company-type', params.get('company-type') || ''),
      industries: f('industries', params.get('industries') || ''),

      bestpractices: params.get('bestpractices') || '',
      enduser: params.get('enduser') || '',
      parent: params.get('parent') || '',
      language: params.get('language') || '',

      selected: params.get('selected') || null,
      embed: params.has('embed'),
    };
  },
  propagateStateToUiAndUrl: function() {
    this.propagateStateToUi();
    this.updateUrl();
  },
  // take a current state, based on it update active tab, filters, and fetch data
  propagateStateToUi: function() {
    const assignSingleSelect = (name) => {
      const value = this.state[name];
      const el = document.querySelector(`.select[data-name=${name}]`);
      el.selectData = el.selectData || JSON.parse(el.getAttribute('data-options'));
      const selectedItem = el.selectData.find( (x) => x.id === value);
      el.setAttribute('data-value', selectedItem.id);
      el.querySelector('option').innerText = selectedItem.label;
    }
    const assignMultiSelect = (name) => {
      const value = this.state[name];
      const el = document.querySelector(`.select[data-name=${name}]`);
      el.selectData = el.selectData || JSON.parse(el.getAttribute('data-options'));
      el.setAttribute('data-value', value);
      const valueInfo = this.calculateShortSelection(el);
      el.querySelector('option').innerText = valueInfo.text;
    }
    assignSingleSelect('sort');
    assignSingleSelect('grouping');
    assignMultiSelect('category');
    assignMultiSelect('project');
    assignMultiSelect('license');
    assignMultiSelect('organization');
    assignMultiSelect('headquarters');
    assignMultiSelect('company-type');
    assignMultiSelect('industries');

    if (CncfLandscapeApp.state.mode === 'card') {
      CncfLandscapeApp.activateCardMode();
    } else if (CncfLandscapeApp.state.mode === 'guide') {
      CncfLandscapeApp.activateGuideMode();
    } else {
      CncfLandscapeApp.activateBigPictureMode(CncfLandscapeApp.state.mode);
    }

    if (CncfLandscapeApp.state.selected) {
      CncfLandscapeApp.showSelectedItem(CncfLandscapeApp.state.selected);
    } else {
      CncfLandscapeApp.hideSelectedItem();
    }

  },
  calculateFullSelection: function(name, value) {
    const wrapper = document.querySelector(`.select[data-name=${name}]`);
    wrapper.selectData = wrapper.selectData || JSON.parse(wrapper.getAttribute('data-options'));
    const selectedIds = value.split(',');
    const result = [];
    // parent selected, all children not - make all children selected
    // parent not selected, some children are - make a parent selected
    for (let i = 0; i < wrapper.selectData.length; i ++) {
      let item = wrapper.selectData[i];
      if (item.level === 1) {
        let allChildren = [];
        let selectedChildren = [];
        for (j = i + 1; j < wrapper.selectData.length; j++) {
          let childItem = wrapper.selectData[j];
          if (childItem.level === 1) {
            break;
          }
          if (selectedIds.includes(childItem.id)) {
            selectedChildren.push(childItem.id);
          }
          allChildren.push(childItem.id)
        }
        if (selectedChildren.length > 0) {
          result.push(item.id);
          result.push(...selectedChildren);
        }
        if (allChildren.length > 0 && selectedChildren.length === 0 && selectedIds.includes(item.id)) {
          result.push(item.id);
          result.push(...allChildren);
        }
        if (allChildren.length === 0 && selectedIds.includes(item.id)) {
          result.push(item.id);
        }
      }
    }
    console.info(name, result);
    return result.join(',');
  },
  // for a given select give an url and a text
  calculateShortSelection: function(wrapper) {
    if (typeof wrapper === 'string') {
      wrapper = document.querySelector(`.select[data-name=${wrapper}]`);
    }
    wrapper = wrapper.closest('.select[data-name]');
    wrapper.selectData = wrapper.selectData || JSON.parse(wrapper.getAttribute('data-options'));
    const value = wrapper.getAttribute('data-value') || '';
    const selectedIds = value.split(',');
    let items = [];
    for (let i = 0; i < wrapper.selectData.length; i ++) {
      let item = wrapper.selectData[i];
      if (item.level === 1 && selectedIds.includes(item.id)) {
        let children = [];
        let totalChildren = 0;
        for (j = i + 1; j < wrapper.selectData.length; j++) {
          let childItem = wrapper.selectData[j];
          if (childItem.level === 1) {
            break;
          }
          if (selectedIds.includes(childItem.id)) {
            children.push(childItem);
          }
          totalChildren += 1;
        }
        if (totalChildren === 0 || children.length === 0 || children.length === totalChildren) {
          items.push(item);
        } else {
          items.push(...children);
        }
      }
    }
    if (items.length === wrapper.selectData.length || items.length === 0) {
      return {
        url: '',
        text: 'Any'
      }
    } else {
      return {
        url: items.map( (x) => x.id).join(','),
        text: items.map( (x) => x.label).join(',')
      }
    }
  },
  // which api to call to fetch actual data
  stringifyApiUrl: function() {
    const params = {};
    const state = this.state;
    for (let field of ['category', 'project', 'license', 'organization', 'headquarters', 'company-type', 'industries']) {
      params[field] = CncfLandscapeApp.calculateShortSelection(field).url
    }
    // no fields for certain filters yet
    for (let field of ['sort', 'grouping', 'bestpractices', 'enduser', 'parent', 'language']) {
      params[field] = state[field]
    }

    if (state.mode !== 'card') {
      params.grouping = 'no';
      params.category = '';
    }
    params.format = state.mode;
    const search = new URLSearchParams(params).toString();
    return search;
  },
  // update a browser url, should be later compatible with a parseUrl call
  stringifyBrowserUrl: function(state) {
    let url = `${this.basePath}/`;
    if (CncfLandscapeApp.state.mode === 'guide') {
      return `${this.basePath}/guide` + (CncfLandscapeApp.state.activeSection ? CncfLandscapeApp.state.activeSection : '') ;
    } else if (CncfLandscapeApp.state.mode === 'card') {
      url = `${this.basePath}/` + CncfLandscapeApp.state.cardStyle + '-mode';
    } else if (CncfLandscapeApp.state.mode !== 'main') {
      url = `${this.basePath}/` + CncfLandscapeApp.state.mode;
    }
    const params = {};

    const initialState = CncfLandscapeApp.initialState;


    for (let field of ['category', 'project', 'license', 'organization', 'headquarters', 'company-type', 'industries']) {
      if (state[field] !== initialState[field]) {
        params[field] = CncfLandscapeApp.calculateShortSelection(field).url
      }
    }
    // no fields for certain filters yet
    for (let field of ['grouping', 'sort', 'selected', 'bestpractices', 'enduser', 'parent', 'language',
      'fullscreen', 'embed']) {
      if (state[field] !== initialState[field]) {
        params[field] = state[field]
      }
    }
    if (state.zoom !== initialState.zoom) {
      params.zoom = (state.zoom * 100).toFixed(0);;
    }


    for (let k in params) {
      if (params[k] === true) {
        params[k] = 'yes';
      }
    }

    const search = new URLSearchParams(params).toString().replace(/%2C/g, ',');
    if (search) {
      url = url + '?' + search;
    }
    return url;
  },
  showSelectedItem: async function(selectedItemId) {
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
  updateUrl: function() {
    const newUrl = CncfLandscapeApp.stringifyBrowserUrl(CncfLandscapeApp.state);
    if (newUrl !== this.previousUrl) {
      history.pushState(CncfLandscapeApp.state, '', newUrl);
      this.previousUrl = newUrl;
      window.ga('send', 'pageview', newUrl);
    }
  },
  hideSelectedItem: function() {
    document.querySelector('.modal').style.display="none";
    document.querySelector('body').style.overflow = '';
    if (window.parentIFrame && this.state.embed) {
      window.parentIFrame.sendMessage({type: 'hideModal'})
    }

    this.updateUrl();
  },
  fetchApiData: async function() {
    const search = this.stringifyApiUrl();
    const url = `${this.basePath}/api/ids?${search}`;
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
    if (CncfLandscapeApp.state.mode !== 'guide') {
      CncfLandscapeApp.previousMode = CncfLandscapeApp.state.mode;
    }
    CncfLandscapeApp.state.mode = 'guide';

    document.querySelector('#home').style.display = "none";
    document.querySelector('#guide-page').style.display = "";

    const contentEl = document.querySelector('#guide-page');
    if (!contentEl.getAttribute('data-loaded')) {
      const url = `${this.basePath}/data/items/guide.html`;
      const result = await fetch(url);
      const text = await result.text();
      contentEl.innerHTML = text;
      contentEl.setAttribute('data-loaded', true);
    }

    const links = contentEl.querySelectorAll('a')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const measureTextWidth = (text, font) => {
        ctx.font = font
        return ctx.measureText(text).width
    }

    links.forEach(linkEl => {
        linkEl.style.letterSpacing = null
        const { fontSize, fontFamily, letterSpacing } = window.getComputedStyle(linkEl)
        const textWidth = measureTextWidth(linkEl.text, `${fontSize} ${fontFamily}`)
        const hoverWidth = measureTextWidth(linkEl.text, `bold ${fontSize} ${fontFamily}`)
        const letterSpacingNum = parseFloat(letterSpacing) || 0
        linkEl.style.letterSpacing = `${letterSpacingNum + (hoverWidth - textWidth) / (linkEl.text.length - 1)}px`
    })

    CncfLandscapeApp.selectGuideSection();
    CncfLandscapeApp.updateUrl();
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

    // edge case: we just opened a tab without filters - then just display everything!
    if (this.state.mode === this.initialMode) {
      const allowedProps = ['bestpractices', 'enduser', 'parent', 'language'];
      const otherProps = ['project', 'license', 'organization', 'headquarters', 'company-type', 'industries']
      let same = true;
      for (let key of [...allowedProps, ...otherProps]) {
        if (this.state[key] !== this.initialState[key]) {
          same = false;
        }
      }
      if (same) {
        const contentEl = document.querySelector(`.landscape-flex[data-mode=${landscape}]`);
        const itemElements = [...contentEl.querySelectorAll('[data-id]')];
        for (let itemEl of itemElements) {
          itemEl.style.visibility = '';
        }
        contentEl.querySelector('.inner-landscape').style.display = "";
      }
    }

    const apiData = await this.fetchApiData();
    const bigPictureItems = apiData.items;
    document.querySelector('h4.summary').innerText = apiData.summaryText;

    const ids = bigPictureItems[0].items.map( (x) => x.id);

    const contentEl = document.querySelector(`.landscape-flex[data-mode=${landscape}]`);
    if (contentEl.querySelector('.inner-landscape').children.length === 0) {
      const tabEl = document.querySelector(`a[data-mode=${landscape}]`);
      const url = `${this.basePath}/data/items/landscape-${tabEl.getAttribute('href')}.html`
      const result = await fetch(url);
      const text = await result.text();
      contentEl.querySelector('.inner-landscape').innerHTML = text;
    }

    const itemElements = [...contentEl.querySelectorAll('[data-id]')];
    for (let itemEl of itemElements) {
      itemEl.style.visibility = ids.includes(itemEl.getAttribute('data-id')) ? '' : 'hidden';
    }

    contentEl.querySelector('.inner-landscape').style.display = "";
  },
  activateCardMode: async function() {
    const cardStyle = CncfLandscapeApp.state.cardStyle;
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
      const response = await fetch(`${this.basePath}/data/items/cards-${cardStyle}.html`);
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

    const apiData = await this.fetchApiData();
    this.groupedItems = apiData.items;
    document.querySelector('h4.summary').innerText = apiData.summaryText;
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
        ${ href ? `<a data-type="internal" href=${href}>${header}</a>` : `<span>${header}</span>` }
        <span class="items-cont">&nbsp;(${count})</span>
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

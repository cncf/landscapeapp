// This is a script which manages absolutely all interactions in a CNCF Landscape
// It should always have zero dependencies on any other script or module
const CncfLandscapeApp = {
  init: function() {
    CncfLandscapeApp.state = {
      mode: 'main', // card, guide, other landscape
      selectedItemId: '', // empty or a selected item id
      orderBy: '', // how to order by
      groupBy: '', // how to group by
      filters: {}, // individual filters by different fields
      isEmbed: true
    }

    CncfLandscapeApp.activateMainMode();
    document.body.addEventListener('click', function(e) {
        const cardEl = e.target.closest('[data-id]');
        if (cardEl) {
          const selectedItemId = cardEl.getAttribute('data-id');
          CncfLandscapeApp.showSelectedItem(selectedItemId);
        }
    }, false);
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
      twttr.widgets.load();
    }
  },
  hideSelectedItem: function() {
    this.state.selectedItemId = null;
    document.querySelector('.modal').style.display="none;";
    document.querySelector('body').style.overflow = '';
  },
  fetchMainData: async function() {
    const params = '';
    const response = await fetch(`/api/items?${params}`);
    const json = await response.json();
    this.groupedItems = json;
  },
  activateMainMode: async function() {

    const cardStyle = 'card';
    CncfLandscapeApp.state.mode = 'main';

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
      this.activateMainMode();
    } else {
      if (!this.groupedItems) {
        await this.fetchMainData();
        this.activateMainMode();
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

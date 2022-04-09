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
  }
};
document.addEventListener('DOMContentLoaded', () => CncfLandscapeApp.init());

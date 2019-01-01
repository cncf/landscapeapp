import { connect } from 'react-redux';
import createSelector from '../utils/createSelector';

import Presets from './Presets';
import settings from 'project/settings.yml';
import { parseUrl, filtersToUrl } from '../utils/syncToUrl';
import _ from 'lodash';

const normalizeUrl = function(url) {
  if (url.indexOf('/') === 0) {
    return url.substring(1);
  }
  return url;
}
const presets = ( function() {
  return settings.presets.map( (preset) => ({...preset, url: normalizeUrl(preset.url)}));
})();
const activePresetSelector = createSelector( (state) => state.main.filters, (state) => state.main.grouping, (state) => state.main.sortField,
  function(filters, grouping, sortField) {
    return  _.find(presets, function(preset) {
      const url = normalizeUrl(preset.url);
      const parts = parseUrl(url);
      const importantParts = _.pick(parts, ['filters', 'grouping', 'sortField']);
      const currentOptions = _.pick(parseUrl(normalizeUrl(filtersToUrl({
        filters: filters,
        grouping: grouping,
        sortField: sortField
      }))), ['filters', 'grouping', 'sortField']);
      return JSON.stringify(importantParts) === JSON.stringify(currentOptions);
    });
  }
)


const mapStateToProps = (state) => ({
  presets: presets,
  activePreset: activePresetSelector(state)
});
const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(Presets);

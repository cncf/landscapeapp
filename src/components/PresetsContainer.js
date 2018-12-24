import { connect } from 'react-redux';
import Presets from './Presets';
import settings from 'project/settings.yml';
import { parseUrl, filtersToUrl } from '../utils/syncToUrl';


const mapStateToProps = (state) => {
  const normalizeUrl = function(url) {
    if (url.indexOf('/') === 0) {
      return url.substring(1);
    }
    return url;
  }
  const presets = settings.presets.map( (preset) => ({...preset, url: normalizeUrl(preset.url)}));
  const activePreset = _.find(presets, function(preset) {
    const url = normalizeUrl(preset.url);
    const parts = parseUrl(url);
    const importantParts = _.pick(parts, ['filters', 'grouping', 'sortField']);
    const currentOptions = _.pick(parseUrl(normalizeUrl(filtersToUrl({
      filters: state.main.filters,
      grouping: state.main.grouping,
      sortField: state.main.sortField
    }))), ['filters', 'grouping', 'sortField']);
    return JSON.stringify(importantParts) === JSON.stringify(currentOptions);
  });
  return {
    presets: presets,
    activePreset: activePreset
  }
};
const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(Presets);

import Presets from './Presets';
import settings from '../utils/settings.js';
import { parseUrl, filtersToUrl } from '../utils/syncToUrl';
import _ from 'lodash';
import { useContext } from 'react'
import RootContext from '../contexts/RootContext'

const normalizeUrl = function(url) {
  if (url.indexOf('/') === 0) {
    return url.substring(1);
  }
  return url;
}
const presets = settings.presets.map(preset => ({...preset, url: normalizeUrl(preset.url)}))

const findPreset = ({ filters, grouping, sortField }) => {
  return presets.find(preset => {
    const url = normalizeUrl(preset.url);
    const parts = parseUrl(url);
    const importantParts = _.pick(parts, ['filters', 'grouping', 'sortField']);

    // TODO: convert old style URLs to new style
    const currentOptions = _.pick(parseUrl(normalizeUrl(filtersToUrl({
      filters: filters,
      grouping: grouping,
      sortField: sortField
    }))), ['filters', 'grouping', 'sortField']);
    return JSON.stringify(importantParts) === JSON.stringify(currentOptions);
  })
}

const PresetsContainer = () => {
  const { params } = useContext(RootContext)
  const activePreset = findPreset(params)
  return <Presets presets={presets} activePreset={activePreset} />
}

export default PresetsContainer

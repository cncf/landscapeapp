import Presets from './Presets';
import settings from 'project/settings.yml';
import { useContext } from 'react'
import EntriesContext from '../contexts/EntriesContext'

const normalizeUrl = function(url) {
  if (url.indexOf('/') === 0) {
    return url.substring(1);
  }
  return url;
}
const presets = settings.presets.map(preset => ({...preset, url: normalizeUrl(preset.url)}))

const findPreset = ({ filters, grouping, sortField }) => {

}

const PresetsContainer = () => {
  const { params } = useContext(EntriesContext)
  // TODO: find active preset
  const activePreset = findPreset(params)
  return <Presets presets={presets} activePreset={activePreset} />
}

export default PresetsContainer

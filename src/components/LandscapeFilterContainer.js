import { useContext } from 'react'
import LandscapeSelector from './LandscapeSelector';
import { changeFilter } from '../reducers/mainReducer.js';
import { options } from '../types/fields';
import RootContext from '../contexts/RootContext'

const onChange = function(newValue) {
  return changeFilter('landscape', newValue);
}

const LandscapeSelectorContainer = () => {
  const { params } = useContext(RootContext)
  const { mainContentMode, filters } = params
  const isBigPicture = mainContentMode !== 'card-mode'
  const value = filters.landscape
  const _options = options('landscape')
  return <LandscapeSelector onChange={onChange} isBigPicture={isBigPicture} value={value} options={_options} />
}

export default LandscapeSelectorContainer

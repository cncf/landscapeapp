import { useContext } from 'react'
import TreeSelector from './TreeSelector';
import { changeFilter } from '../reducers/mainReducer.js';
import { options } from '../types/fields';
import RootContext from '../contexts/RootContext'

const onChange = function(newValue) {
  return changeFilter('license', newValue);
}

const LicenseFilterContainer = () => {
  const { params } = useContext(RootContext)
  const value = params.filters.license
  const _options = options('license')
  return <TreeSelector onChange={onChange} value={value} options={_options} />
}

export default LicenseFilterContainer

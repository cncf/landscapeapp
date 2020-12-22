import { useContext } from 'react'
import ComboboxSelector from './ComboboxSelector';
import { changeFilter } from '../reducers/mainReducer.js';
import { options } from '../types/fields';
import RootContext from '../contexts/RootContext'

const onChange = function(newValue) {
  return changeFilter('oss', newValue);
}

const OssFilterContainer = () => {
  const { params } = useContext(RootContext)
  const value = params.filters.oss
  const _options = options('oss')
  return <ComboboxSelector onChange={onChange} value={value} options={_options}/>
}

export default OssFilterContainer

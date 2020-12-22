import TreeSelector from './TreeSelector';
import { changeFilter } from '../reducers/mainReducer.js';
import { options } from '../types/fields';
import { useContext } from 'react'
import RootContext from '../contexts/RootContext'

const onChange = function(newValue) {
  return changeFilter('headquarters', newValue);
}

const HeadquartersFilterContainer = () => {
  const { params } = useContext(RootContext)
  const value = params.filters.headquarters
  const _options = options('headquarters')
  return <TreeSelector onChange={onChange} value={value} options={_options} />
}

export default HeadquartersFilterContainer

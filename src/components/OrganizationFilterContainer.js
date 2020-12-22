import ComboboxMultiSelector from './ComboboxMultiSelector';
import { changeFilter } from '../reducers/mainReducer.js';
import { options } from '../types/fields';
import { useContext } from 'react'
import RootContext from '../contexts/RootContext'

const onChange = function(newValue) {
  return changeFilter('organization', newValue);
}

const OrganizationFilterContainer = () => {
  const { params } = useContext(RootContext)
  const value = params.filters.organization
  const _options = options('organization')
  return <ComboboxMultiSelector onChange={onChange} value={value} options={_options} />
}

export default OrganizationFilterContainer

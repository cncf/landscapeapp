import TreeSelector from './TreeSelector';
import { changeFilter } from '../reducers/mainReducer';
import { options } from '../types/fields';
import { useContext } from 'react'
import RootContext from '../contexts/RootContext'

const onChange = function(newValue) {
  return changeFilter('relation', newValue);
}

const ProjectFilterContainer = () => {
  const { params } = useContext(RootContext)
  const value = params.filters.relation
  const _options = options('relation')
  return <TreeSelector onChange={onChange} options={_options} value={value} />
}

export default ProjectFilterContainer

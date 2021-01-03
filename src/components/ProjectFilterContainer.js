import TreeSelector from './TreeSelector';
import { options } from '../types/fields';
import { useContext } from 'react'
import EntriesContext from '../contexts/EntriesContext'

const ProjectFilterContainer = () => {
  const { navigate, params } = useContext(EntriesContext)
  const value = params.filters.relation
  const _options = options('relation')
  const onChange = relation => navigate({ filters: { relation }})
  return <TreeSelector onChange={onChange} options={_options} value={value} />
}

export default ProjectFilterContainer

import TreeSelector from './TreeSelector';
import { options } from '../types/fields';
import { useContext } from 'react'
import LandscapeContext from '../contexts/LandscapeContext'

const ProjectFilterContainer = () => {
  const { navigate, params } = useContext(LandscapeContext)
  const value = params.filters.relation
  const _options = options('relation')
  const onChange = relation => navigate({ filters: { relation }})
  return <TreeSelector onChange={onChange} options={_options} value={value} />
}

export default ProjectFilterContainer

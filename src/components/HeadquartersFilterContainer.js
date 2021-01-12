import TreeSelector from './TreeSelector';
import { options } from '../types/fields';
import { useContext } from 'react'
import LandscapeContext from '../contexts/LandscapeContext'

const HeadquartersFilterContainer = () => {
  const { navigate, params } = useContext(LandscapeContext)
  const value = params.filters.headquarters
  const _options = options('headquarters')
  const onChange = value => navigate({ filters: { headquarters: value }})
  return <TreeSelector onChange={onChange} value={value} options={_options} />
}

export default HeadquartersFilterContainer

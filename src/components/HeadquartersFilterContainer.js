import TreeSelector from './TreeSelector';
import { options } from '../types/fields';
import { useContext } from 'react'
import EntriesContext from '../contexts/EntriesContext'

const HeadquartersFilterContainer = () => {
  const { navigate, params } = useContext(EntriesContext)
  const value = params.filters.headquarters
  const _options = options('headquarters')
  const onChange = value => navigate({ filters: { headquarters: value }})
  return <TreeSelector onChange={onChange} value={value} options={_options} />
}

export default HeadquartersFilterContainer

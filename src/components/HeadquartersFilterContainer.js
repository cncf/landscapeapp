import TreeSelector from './TreeSelector';
import { options } from '../types/fields';
import { useContext } from 'react'
import RootContext from '../contexts/RootContext'
import EntriesContext from '../contexts/EntriesContext'

const HeadquartersFilterContainer = () => {
  const { params } = useContext(RootContext)
  const { navigate } = useContext(EntriesContext)
  const value = params.filters.headquarters
  const _options = options('headquarters')
  const onChange = value => navigate({ filters: { headquarters: value }})
  return <TreeSelector onChange={onChange} value={value} options={_options} />
}

export default HeadquartersFilterContainer

import ComboboxMultiSelector from './ComboboxMultiSelector';
import { options } from '../types/fields';
import { useContext } from 'react'
import RootContext from '../contexts/RootContext'
import EntriesContext from '../contexts/EntriesContext'

const OrganizationFilterContainer = () => {
  const { params } = useContext(RootContext)
  const { navigate } = useContext(EntriesContext)
  const value = params.filters.organization
  const _options = options('organization')
  const onChange = organization => navigate({ filters: { organization } })
  return <ComboboxMultiSelector onChange={onChange} value={value} options={_options} />
}

export default OrganizationFilterContainer

import ComboboxMultiSelector from './ComboboxMultiSelector';
import { options } from '../types/fields';
import { useContext } from 'react'
import EntriesContext from '../contexts/EntriesContext'

const OrganizationFilterContainer = () => {
  const { navigate, params } = useContext(EntriesContext)
  const value = params.filters.organization
  const _options = options('organization')
  const onChange = organization => navigate({ filters: { organization } })
  return <ComboboxMultiSelector onChange={onChange} value={value} options={_options} />
}

export default OrganizationFilterContainer

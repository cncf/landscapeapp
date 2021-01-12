import ComboboxMultiSelector from './ComboboxMultiSelector';
import { options } from '../types/fields';
import { useContext } from 'react'
import LandscapeContext from '../contexts/LandscapeContext'

const OrganizationFilterContainer = () => {
  const { navigate, params } = useContext(LandscapeContext)
  const value = params.filters.organization
  const _options = options('organization')
  const onChange = organization => navigate({ filters: { organization } })
  return <ComboboxMultiSelector onChange={onChange} value={value} options={_options} />
}

export default OrganizationFilterContainer

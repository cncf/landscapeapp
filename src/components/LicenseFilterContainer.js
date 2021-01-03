import { useContext } from 'react'
import TreeSelector from './TreeSelector';
import { options } from '../types/fields';
import EntriesContext from '../contexts/EntriesContext'

const LicenseFilterContainer = () => {
  const { navigate, params } = useContext(EntriesContext)
  const value = params.filters.license
  const _options = options('license')
  const onChange = license => navigate({ filters: { license }})
  return <TreeSelector onChange={onChange} value={value} options={_options} />
}

export default LicenseFilterContainer

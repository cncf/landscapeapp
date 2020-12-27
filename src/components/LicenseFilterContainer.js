import { useContext } from 'react'
import TreeSelector from './TreeSelector';
import { options } from '../types/fields';
import RootContext from '../contexts/RootContext'
import EntriesContext from '../contexts/EntriesContext'

const LicenseFilterContainer = () => {
  const { params } = useContext(RootContext)
  const { navigate } = useContext(EntriesContext)
  const value = params.filters.license
  const _options = options('license')
  const onChange = license => navigate({ filters: { license }})
  return <TreeSelector onChange={onChange} value={value} options={_options} />
}

export default LicenseFilterContainer

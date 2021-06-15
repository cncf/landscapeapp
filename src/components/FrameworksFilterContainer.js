import ComboboxMultiSelector from './ComboboxMultiSelector';
import { options } from '../types/fields';
import { useContext } from 'react'
import LandscapeContext from '../contexts/LandscapeContext'



const FrameworksFilterContainer = () => {
  const { navigate, params } = useContext(LandscapeContext)
  const value = params.filters.frameworks_filter
  const _options = options('frameworks_filter')
  const onChange = frameworks_filter => navigate({ filters: { frameworks_filter } })
  return <ComboboxMultiSelector onChange={onChange} value={value} options={_options} />
}

export default FrameworksFilterContainer



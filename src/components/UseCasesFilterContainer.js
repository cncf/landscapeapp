import ComboboxMultiSelector from './ComboboxMultiSelector';
import { options } from '../types/fields';
import { useContext } from 'react'
import LandscapeContext from '../contexts/LandscapeContext'



const UseCasesFilterContainer = () => {
  const { navigate, params } = useContext(LandscapeContext)
  const value = params.filters.use_cases_filter
  const _options = options('use_cases_filter')
  const onChange = use_cases_filter => navigate({ filters: { use_cases_filter } })
  return <ComboboxMultiSelector onChange={onChange} value={value} options={_options} />
}

export default UseCasesFilterContainer


import ComboboxMultiSelector from './ComboboxMultiSelector';
import { options } from '../types/fields';
import { useContext } from 'react'
import LandscapeContext from '../contexts/LandscapeContext'



const IsvStatusFilterContainer = () => {
  const { navigate, params } = useContext(LandscapeContext)
  const value = params.filters.status
  const _options = options('status')
  const onChange = status => navigate({ filters: { status } })
  return <ComboboxMultiSelector onChange={onChange} value={value} options={_options} />
}

export default IsvStatusFilterContainer;
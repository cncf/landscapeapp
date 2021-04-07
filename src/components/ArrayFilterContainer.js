import { useContext } from 'react'
import ComboboxMultiSelector from './ComboboxMultiSelector'
import { options } from '../types/fields';
import LandscapeContext from '../contexts/LandscapeContext'

const ArrayFilterContainer = ({ name }) => {
  const { navigate, params } = useContext(LandscapeContext)
  const value = params.filters[name]
  const _options = options(name)
  const onChange = value => navigate({ filters: { [name]: value } })
  return <ComboboxMultiSelector onChange={onChange} value={value} options={_options} />
}

export default ArrayFilterContainer

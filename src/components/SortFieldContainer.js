import { useContext } from 'react'
import { sortOptions } from '../types/fields'
import SortFieldSelector from './SortFieldSelector'
import LandscapeContext from '../contexts/LandscapeContext'

const SortFieldContainer = () => {
  const { navigate, params } = useContext(LandscapeContext)
  const isBigPicture = params.mainContentMode !== 'card-mode'
  const value = params.sortField
  const options = sortOptions.filter(field => !field.disabled)

  const onChange = sortField => navigate({ sortField })

  return <SortFieldSelector isBigPicture={isBigPicture} value={value} onChange={onChange} options={options} />
}

export default SortFieldContainer

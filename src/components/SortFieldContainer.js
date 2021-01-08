import { useContext } from 'react'
import { sortOptions } from '../types/fields'
import SortFieldSelector from './SortFieldSelector'
import EntriesContext from '../contexts/EntriesContext'

const SortFieldContainer = () => {
  const { navigate, params } = useContext(EntriesContext)
  const isBigPicture = params.mainContentMode !== 'card-mode'
  const value = params.sortField

  const onChange = sortField => navigate({ sortField })

  return <SortFieldSelector isBigPicture={isBigPicture} value={value} onChange={onChange} options={sortOptions} />
}

export default SortFieldContainer

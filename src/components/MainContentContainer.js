import MainContent from './MainContent';
import getGroupedItems from '../utils/itemsCalculator';
import { useContext } from 'react'
import EntriesContext from '../contexts/EntriesContext'

const MainContentContainer = () => {
  const { entries, params } = useContext(EntriesContext)
  const { cardMode } = params
  const groupedItems = getGroupedItems(params, entries)

  // TODO: pass openSelectedItemIdInNewTab

  return <MainContent cardMode={cardMode} groupedItems={groupedItems} />
}

export default MainContentContainer

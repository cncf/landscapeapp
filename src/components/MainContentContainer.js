import MainContent from './MainContent';
import { openSelectedItemIdInNewTab, changeSelectedItemId} from '../reducers/mainReducer';
import getGroupedItems from '../utils/itemsCalculator';
import { useContext } from 'react'
import RootContext from '../contexts/RootContext'
import EntriesContext from '../contexts/EntriesContext'

const MainContentContainer = () => {
  const { params } = useContext(RootContext)
  const { entries } = useContext(EntriesContext)
  const { cardMode } = params
  const groupedItems = getGroupedItems(params, entries)

  // TODO: pass changeSelectedItemId
  // TODO: pass openSelectedItemIdInNewTab

  return <MainContent cardMode={cardMode} groupedItems={groupedItems} />
}

export default MainContentContainer

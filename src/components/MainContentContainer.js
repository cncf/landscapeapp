import MainContent from './MainContent';
import { useContext } from 'react'
import EntriesContext from '../contexts/EntriesContext'

const MainContentContainer = () => {
  const { params, groupedItems } = useContext(EntriesContext)
  const { cardMode } = params

  // TODO: pass openSelectedItemIdInNewTab

  return <MainContent cardMode={cardMode} groupedItems={groupedItems} />
}

export default MainContentContainer

import { createContext } from 'react'
import { useRouter } from 'next/router'
import routeToParams from '../utils/routeToParams'
import { findLandscapeSettings } from '../utils/landscapeSettings'
import getGroupedItems, { getGroupedItemsForBigPicture } from '../utils/itemsCalculator'
import selectedItemCalculator from '../utils/selectedItemCalculator'
import { calculateSize } from '../utils/landscapeCalculations'
import paramsToRoute from '../utils/paramsToRoute'

const LandscapeContext = createContext()

export const LandscapeProvider = ({ entries, pageParams, children }) => {
  const router = useRouter()
  const params = routeToParams({ ...pageParams, ...router.query })

  const landscapeSettings = findLandscapeSettings(params.mainContentMode)
  const isBigPicture = params.mainContentMode !== 'card-mode'
  const groupedItems = getGroupedItems(params, entries)
  const groupedItemsForBigPicture = getGroupedItemsForBigPicture(params, entries, landscapeSettings)
  const selectedItemId = params.selectedItemId
  const { nextItemId, previousItemId } = selectedItemCalculator(groupedItems, groupedItemsForBigPicture, selectedItemId, isBigPicture)
  const size = calculateSize(landscapeSettings)

  const navigate = (newParams = {}) => {
    const filters = { ...(params.filters || {}), ...(newParams.filters || {}) }
    const url = paramsToRoute({ ...params, ...newParams, filters })
    router.push(url)
  }

  const baseProps = {
    entries,
    navigate,
    groupedItems,
    nextItemId,
    previousItemId,
    params,
    landscapeSettings,
    groupedItemsForBigPicture,
    ...size
  }

  return <LandscapeContext.Provider value={baseProps}>
    {children}
  </LandscapeContext.Provider>
}

export default LandscapeContext

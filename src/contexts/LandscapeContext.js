import { createContext } from 'react'
import { useRouter } from 'next/router'
import { parseParams } from '../utils/routing'
import { findLandscapeSettings } from '../utils/landscapeSettings'
import { getGroupedItemsForContentMode } from '../utils/itemsCalculator'
import selectedItemCalculator from '../utils/selectedItemCalculator'
import { calculateSize } from '../utils/landscapeCalculations'
import { stringifyParams } from '../utils/routing'

const LandscapeContext = createContext()

export const LandscapeProvider = ({ entries, pageParams, guideIndex = {}, children }) => {
  const router = useRouter()
  const params = parseParams({ ...pageParams, ...router.query })

  const landscapeSettings = findLandscapeSettings(params.mainContentMode)
  const isBigPicture = params.mainContentMode !== 'card-mode'
  const groupedItems = getGroupedItemsForContentMode(params, entries, landscapeSettings)
  const selectedItemId = params.selectedItemId
  const { nextItemId, previousItemId } = selectedItemCalculator(groupedItems, selectedItemId, isBigPicture)
  const size = calculateSize(landscapeSettings)

  const navigate = (newParams = {}, options = {}) => {
    const filters = { ...(params.filters || {}), ...(newParams.filters || {}) }
    const url = stringifyParams({ ...params, ...newParams, filters })
    router.push(url, null, options)
  }

  const baseProps = {
    entries,
    navigate,
    groupedItems,
    nextItemId,
    previousItemId,
    params,
    landscapeSettings,
    guideIndex,
    ...size
  }

  return <LandscapeContext.Provider value={baseProps}>
    {children}
  </LandscapeContext.Provider>
}

export default LandscapeContext

import { useContext } from 'react'
import settings from 'project/settings.yml';
import SortFieldSelector from './SortFieldSelector'
import RootContext from '../contexts/RootContext'
import EntriesContext from '../contexts/EntriesContext'

// TODO: move this somewhere else
export const options = [{
  id: 'name',
  direction: 'asc',
  label: 'Alphabetical (a to z)',
}, {
  id: 'stars',
  direction: 'desc',
  label: 'Stars (high to low)',
}, {
  id: 'amount',
  direction: 'desc',
  label: 'Funding / Market Cap (high to low)',
  disabled: settings.global.hide_funding_and_market_cap
}, {
  id: 'firstCommitDate',
  direction: 'asc',
  label: 'Project Started (earlier to later)',
}, {
  id: 'latestCommitDate',
  direction: 'asc',
  label: 'Latest Commit (earlier to later)',
}, {
  id: 'latestTweetDate',
  direction: 'asc',
  label: 'Latest Tweet (earlier to later)',
}, {
  id: 'contributorsCount',
  direction: 'desc',
  label: 'Contributors # (high to low)',
}, {
  id: 'commitsThisYear',
  direction: 'desc',
  label: 'Commits this year (high to low)',
}].filter(field => !field.disabled)

const SortFieldContainer = () => {
  const { params } = useContext(RootContext)
  const { navigate } = useContext(EntriesContext)
  const isBigPicture = params.mainContentMode !== 'card-mode'
  const value = params.sortField

  const onChange = sortField => navigate({ sortField })

  return <SortFieldSelector isBigPicture={isBigPicture} value={value} onChange={onChange} options={options} />
}

export default SortFieldContainer

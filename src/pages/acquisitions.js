import { uniqBy } from 'lodash'
import Acquisitions from '../components/Acquisitions'
import { projects } from '../../tools/loadData'


const AcquisitionsPage = ({ acquisitions, members, acquirers, acquirees }) => {
  return <Acquisitions acquisitions={acquisitions}
                       members={members}
                       acquirers={acquirers}
                       acquirees={acquirees}
  />
}

export async function getStaticProps() {
  const organizations = uniqBy(projects, 'crunchbase')

  const acquisitions = organizations
    .filter(({ crunchbaseData }) => crunchbaseData && crunchbaseData.acquisitions)
    .map(({ crunchbaseData }) => {
      return crunchbaseData.acquisitions.map(data => ({ acquirer: crunchbaseData.name, ...data }))
    })
    .flat()

  const members = organizations.map(({ crunchbaseData }) => crunchbaseData.name)

  return { props: { acquisitions, members }}
}

export default AcquisitionsPage

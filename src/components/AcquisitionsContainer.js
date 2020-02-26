import React from 'react'
import { connect } from 'react-redux'
import { uniqBy, sortBy } from 'lodash'
import Acquisitions from './Acquisitions'

const mapStateToProps = (state) => {
  return { data: state.main.data || [] }
};

const makeOptions = (arr) => sortBy(uniqBy(arr, 'permalink'), 'name')

const AcquisitionsContainer = ({ data }) => {
  const organizations = uniqBy(data, 'crunchbase')

  const acquisitions = organizations
    .filter(({ crunchbaseData }) => crunchbaseData && crunchbaseData.acquisitions)
    .map(({ crunchbase, crunchbaseData }) => {
      return crunchbaseData.acquisitions.map(({ date, ...data }) => {
        const name = crunchbaseData.name
        const permalink = crunchbase.split('/').pop()
        return {
          acquirer: { permalink, name },
          date: new Date(date),
          ...data
        }
      })
    })
    .flat()
    .sort((a, b) => b.date - a.date)

  const members = new Set(organizations.map(({ crunchbase }) => crunchbase.split('/').pop()))
  const acquirers = makeOptions(acquisitions.map(a => a.acquirer))
  const acquirees = makeOptions(acquisitions.map(a => a.acquiree).filter(a => a.permalink))

  return <Acquisitions acquisitions={acquisitions}
                       members={members}
                       acquirers={acquirers}
                       acquirees={acquirees}
  />
}

export default connect(mapStateToProps)(AcquisitionsContainer);

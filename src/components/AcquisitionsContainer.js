import React from 'react'
import { connect } from 'react-redux'
import { uniq, uniqBy, sortBy } from 'lodash'
import Acquisitions from './Acquisitions'

const mapStateToProps = (state) => {
  return { data: state.main.data || [] }
};

const makeOptions = (arr) => sortBy(uniq(arr), name => name.toLowerCase())

const AcquisitionsContainer = ({ data }) => {
  const organizations = uniqBy(data, 'crunchbase')

  const acquisitions = organizations
    .filter(({ crunchbaseData }) => crunchbaseData && crunchbaseData.acquisitions)
    .map(({ crunchbaseData }) => {
      return crunchbaseData.acquisitions.map(({ date, ...data }) => {
        const acquirer = crunchbaseData.name
        return {
          date: new Date(date),
          acquirer,
          ...data
        }
      })
    })
    .flat()
    .sort((a, b) => b.date - a.date)

  const members = new Set(organizations.map(({ crunchbaseData }) => crunchbaseData.name))
  const acquirers = makeOptions(acquisitions.map(a => a.acquirer))
  const acquirees = makeOptions(acquisitions.map(a => a.acquiree).filter(a => a))

  return <Acquisitions acquisitions={acquisitions}
                       members={members}
                       acquirers={acquirers}
                       acquirees={acquirees}
  />
}

export default connect(mapStateToProps)(AcquisitionsContainer);

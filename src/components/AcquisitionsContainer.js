import React, { useState } from 'react'
import { connect } from 'react-redux'
import { uniqBy } from 'lodash'
import Acquisitions from './Acquisitions'

const mapStateToProps = (state) => {
  return { data: state.main.data || [] }
};

const AcquisitionsContainer = ({ data }) => {
  const [page, setPage] = useState(0)

  const rowsPerPage = 20

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

  return <Acquisitions acquisitions={acquisitions.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
                       total={acquisitions.length}
                       page={page}
                       setPage={setPage}
                       rowsPerPage={rowsPerPage}
                       members={members}
  />
}

export default connect(mapStateToProps)(AcquisitionsContainer);

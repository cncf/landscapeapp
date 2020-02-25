import React from 'react'
import Container from '@material-ui/core/Container';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import millify from 'millify';
import saneName from '../utils/saneName';
import OutboundLink from './OutboundLink';

export default ({ acquisitions, page, setPage, total, rowsPerPage, members }) => {
  const linkToOrg = ({ name, permalink }) => {
    if (!members.has(permalink)) {
      return name
    }
    return <OutboundLink to={`/organization=${saneName(name)}`}>{name}</OutboundLink>
  }

  const rowKey = ({ acquirer, acquiree, date }) => {
    return `${acquirer.permalink}-${acquiree && acquiree.permalink}-${date.toString()}`
  }

  return <Container maxWidth="lg" disableGutters={true} >
    <Paper>
      <Box mt={3} px={2} pt={2} pb={1}>
        <Typography variant="h6">Acquisitions</Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Acquirer</TableCell>
              <TableCell>Acquiree</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {acquisitions.map(acquisition => {
              return <TableRow key={rowKey(acquisition)}>
                <TableCell>{linkToOrg(acquisition.acquirer)}</TableCell>
                <TableCell>{acquisition.acquiree && linkToOrg(acquisition.acquiree)}</TableCell>
                <TableCell align="right">{acquisition.price && `$${millify(acquisition.price)}`}</TableCell>
                <TableCell align="right">{acquisition.date.toLocaleDateString()}</TableCell>
              </TableRow>
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        rowsPerPageOptions={[]}
        onChangePage={(_, page) => setPage(page)}
      />
    </Paper>
  </Container>
}

import React, { useState } from 'react'
import Container from '@material-ui/core/Container'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Typography from "@material-ui/core/Typography"
import Box from "@material-ui/core/Box"
import Toolbar from "@material-ui/core/Toolbar"
import TextField from "@material-ui/core/TextField"
import FormControl from "@material-ui/core/FormControl"
import InputLabel from "@material-ui/core/InputLabel"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogContent from "@material-ui/core/DialogContent"
import DialogActions from "@material-ui/core/DialogActions"
import FilterListIcon from "@material-ui/icons/FilterList"
import Autocomplete from "@material-ui/lab/Autocomplete"
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import millify from 'millify'
import OutboundLink from './OutboundLink'
import { filtersToUrl } from '../utils/syncToUrl'

export default ({ acquisitions, members, acquirers, acquirees }) => {
  const linkToOrg = (name) => {
    if (!members.has(name)) {
      return name
    }
    return <OutboundLink to={filtersToUrl({mainContentMode: 'landscape', filters: { organization: name}})}>{name}</OutboundLink>
  }

  const rowKey = ({ acquirer, acquiree, date }) => {
    return `${acquirer}-${acquiree}-${date.toString()}`
  }

  const rowsPerPage = 20
  const [page, setPage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const closeDialog = () => setDialogOpen(false)
  const defaultFilters = {
    acquirers: [],
    acquirees: [],
    min_date: null,
    max_date: null,
    min_price: '',
    max_price: ''
  }
  const priceOptions = [
    { label: '', value: '' },
    { label: '$100M', value: 100000000 },
    { label: '$250M', value: 250000000 },
    { label: '$500M', value: 500000000 },
    { label: '$1B', value: 1000000000 },
    { label: '$5B', value: 5000000000 },
    { label: '$10B', value: 10000000000 },
    { label: '$20B', value: 20000000000 },
    { label: '$50B', value: 50000000000 },
    { label: '$100B', value: 100000000000 }
  ]
  const [filters, setFilters] = useState(defaultFilters)
  const filterFn = (acquisition) => {
    if (filters.acquirers.length > 0 && !filters.acquirers.includes(acquisition.acquirer)) {
      return false
    }
    if (filters.acquirees.length > 0 && !filters.acquirees.includes(acquisition.acquiree)) {
      return false
    }
    if (filters.min_date && filters.min_date > acquisition.date) {
      return false
    }
    if (filters.max_date && filters.max_date < acquisition.date) {
      return false
    }
    if (filters.min_price && (!acquisition.price || filters.min_price > acquisition.price)) {
      return false
    }
    if (filters.max_price && (!acquisition.price || filters.max_price < acquisition.price)) {
      return false
    }
    return true
  }

  const resetFilters = () => {
    setPage(0)
    setFilters(defaultFilters)
  }
  const setFilter = (name, value) => {
    setPage(0)
    setFilters({ ...filters, [name]: value })
  }

  const hasFilters = () => {
    const { acquirers, acquirees, min_date, max_date, min_price, max_price } = filters
    return acquirers.length > 0 || acquirees.length > 0 || min_date || max_date || min_price || max_price
  }

  const filteredAcquisitions = acquisitions.filter(filterFn)

  const data = filteredAcquisitions.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

  const filterDialog = () => {
    return <Dialog onClose={closeDialog} open={dialogOpen} maxWidth='sm' fullWidth={true}>
      <DialogTitle>Filter Acquisitions</DialogTitle>
      <DialogContent>
        <Box mb={3}>
          <Autocomplete
            multiple
            options={acquirers}
            value={filters.acquirers}
            renderInput={params => <TextField {...params} label="Acquirer"/>}
            onChange={(_, value) => setFilter('acquirers', value)}
          />
        </Box>
        <Box mb={3}>
          <Autocomplete
            multiple
            options={acquirees}
            value={filters.acquirees}
            renderInput={params => <TextField {...params} label="Acquiree" />}
            onChange={(_, value) => setFilter('acquirees', value)}
          />
        </Box>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Box mb={3} flexDirection="row" display={"flex"}>
            <Box mr={2} flexGrow="1">
              <DatePicker
                value={filters.min_date}
                onChange={value => setFilter('min_date', value)}
                label="From Date"
                autoOk
                fullWidth
                disableFuture
                labelFunc={(date) => date ? date.toLocaleDateString() : ''}
                clearable={true}
              />
            </Box>
            <Box ml={2} flexGrow="1">
              <DatePicker
                value={filters.max_date}
                onChange={value => setFilter('max_date', value)}
                label="To Date"
                autoOk
                fullWidth
                disableFuture
                labelFunc={(date) => date ? date.toLocaleDateString() : ''}
                clearable={true}
              />
            </Box>
          </Box>
        </MuiPickersUtilsProvider>
        <Box mb={5} flexDirection="row" display={"flex"}>
          <Box mr={2} flexGrow="1">
            <FormControl fullWidth={true}>
              <InputLabel>Min Price</InputLabel>
              <Select
                value={filters.min_price}
                onChange={e => setFilter('min_price', e.target.value)}
              >
                {priceOptions.map(({ value, label }) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box ml={2} flexGrow="1">
            <FormControl fullWidth={true}>
              <InputLabel>Max Price</InputLabel>
              <Select
                value={filters.max_price}
                onChange={e => setFilter('max_price', e.target.value)}
              >
                {priceOptions.map(({ value, label }) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetFilters} color="primary">
          Reset
        </Button>
        <Button onClick={closeDialog}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  }

  return <Container maxWidth="lg" disableGutters={true}>
    <Paper>
      <Toolbar variant="dense">
        <Box flexGrow="1">
          <Typography variant="h6">
            Acquisitions
          </Typography>
        </Box>

        { hasFilters() ?
          <Button color="primary" onClick={resetFilters}>Reset</Button>
          : null
        }

        <Button
          aria-label="filter list"
          onClick={() => setDialogOpen(true)}
          endIcon={<FilterListIcon>filter</FilterListIcon>}
        >
          Filter
        </Button>

        {filterDialog()}
      </Toolbar>
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
            {data.map(acquisition => {
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
        count={filteredAcquisitions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        rowsPerPageOptions={[]}
        onChangePage={(_, page) => setPage(page)}
      />
    </Paper>
  </Container>
}

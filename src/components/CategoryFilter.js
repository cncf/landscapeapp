import React, { useContext } from 'react';
import { pure } from 'recompose';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TreeSelector from './TreeSelector';
import RootContext from '../contexts/RootContext'
import EntriesContext from '../contexts/EntriesContext'
import { options } from '../types/fields'

const CategoryFilter = _ => {
  const { params } = useContext(RootContext)
  const { navigate } = useContext(EntriesContext)
  const { mainContentMode, filters } = params
  const isBigPicture = mainContentMode !== 'card-mode'
  const value = filters.landscape
  const _options = options('landscape')
  const onChange = landscape => navigate({ filters: { landscape }})

  if (!isBigPicture) {
    return <TreeSelector value={value} options={_options} onChange={onChange} />;
  } else {
    return (
      <Select
        disabled
        value="empty"
        style={{width:175 ,fontSize:'0.8em'}}
      >
        <MenuItem value="empty">
          <em>N/A</em>
        </MenuItem>
      </Select>
    );
  }
};
export default pure(CategoryFilter);
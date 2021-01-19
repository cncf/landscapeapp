import React, { useContext } from 'react';
import { pure } from 'recompose';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ComboboxSelector from './ComboboxSelector';
import fields from '../types/fields'
import LandscapeContext from '../contexts/LandscapeContext'

const groupingFields = ['landscape', 'relation', 'license', 'organization', 'headquarters'];
const options = [{
  id: 'no',
  label: 'No Grouping',
  url: 'no'
}].concat(groupingFields.map(id => ({ id, label: fields[id].groupingLabel })))

const GroupingSelector = _ => {
  const { navigate, params } = useContext(LandscapeContext)
  const { grouping, mainContentMode } = params
  const isBigPicture = mainContentMode !== 'card-mode'
  const onChange = grouping => navigate({ grouping })

  if (!isBigPicture) {
    return <ComboboxSelector value={grouping} options={options} onChange={onChange} />;
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
export default pure(GroupingSelector);

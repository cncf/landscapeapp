import React from 'react';
import { pure } from 'recompose';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import GroupingSelector from './GroupingSelector';
const Grouping = () => {
  return <FormGroup row>
        <FormControl component="fieldset">
          <FormLabel component="legend">Grouping</FormLabel>
          <GroupingSelector />
        </FormControl>
      </FormGroup>;
};
export default pure(Grouping);

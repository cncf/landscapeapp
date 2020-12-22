import { useContext } from 'react'
import GroupingSelector from './GroupingSelector';
import { changeGrouping } from '../reducers/mainReducer.js';
import fields from '../types/fields';
import RootContext from '../contexts/RootContext'

const groupingFields = ['landscape', 'relation', 'license', 'organization', 'headquarters'];
const options = [{
  id: 'no',
  label: 'No Grouping',
  url: 'no'
}].concat(groupingFields.map(function(x) {
  return  {
    id: x,
    label: fields[x].groupingLabel
  };
}));

const GroupingTypeContainer = () => {
  const { params } = useContext(RootContext)
  const { grouping, mainContentMode } = params
  const isBigPicture = mainContentMode !== 'card'

  return <GroupingSelector onChange={changeGrouping} grouping={grouping} isBigPicture={isBigPicture} options={options}/>
}

export default GroupingTypeContainer

import { connect } from 'react-redux';
import GroupingSelector from './GroupingSelector';
import { changeGrouping } from '../reducers/mainReducer.js';
import fields from '../types/fields';

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

const mapStateToProps = (state) => ({
  isBigPicture: state.main.mainContentMode !== 'card',
  value: state.main.grouping,
  options: options
});
const onChange = function(newValue) {
  return changeGrouping(newValue);
}
const mapDispatchToProps = {
  onChange: onChange
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupingSelector);

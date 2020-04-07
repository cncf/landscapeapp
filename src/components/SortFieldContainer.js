import settings from 'project/settings.yml';
import { connect } from 'react-redux';
import SortFieldSelector from './SortFieldSelector';
import { changeSortFieldAndDirection } from '../reducers/mainReducer.js';

export const options = [{
  id: {field: 'name', direction: 'asc'},
  label: 'Alphabetical (a to z)',
}, {
  id: {field: 'stars', direction: 'desc'},
  label: 'Stars (high to low)',
}, {
  id: {field: 'amount', direction: 'desc'},
  label: 'Funding / Market Cap (high to low)',
  disabled: settings.global.hide_funding_and_market_cap
}, {
  id: {field: 'firstCommitDate', direction: 'asc'},
  label: 'Project Started (earlier to later)',
}, {
  id: {field: 'latestCommitDate', direction: 'asc'},
  label: 'Latest Commit (earlier to later)',
}, {
  id: {field: 'latestTweetDate', direction: 'asc'},
  label: 'Latest Tweet (earlier to later)',
}, {
  id: {field: 'contributorsCount', direction: 'desc'},
  label: 'Contributors # (high to low)',
}, {
  id: {field: 'commitsThisYear', direction: 'desc'},
  label: 'Commits this year (high to low)',
}].filter( (x) => !x.disabled).map(function(x) {
  return {
    id: JSON.stringify(x.id),
    label: x.label
  }
});

const mapStateToProps = (state) => ({
  isBigPicture: state.main.mainContentMode !== 'card',
  value: JSON.stringify({
    field: state.main.sortField,
    direction: state.main.sortDirection
  }),
  options: options
});
const onChange = function(newValue) {
  return changeSortFieldAndDirection(JSON.parse(newValue));
}
const mapDispatchToProps = {
  onChange: onChange
};

export default connect(mapStateToProps, mapDispatchToProps)(SortFieldSelector);

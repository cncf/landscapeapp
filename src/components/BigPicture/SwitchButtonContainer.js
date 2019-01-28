import { connect } from 'react-redux';
import SwitchButton from './SwitchButton';
import { changeMainContentMode } from '../../reducers/mainReducer.js';
import { filtersToUrl } from '../../utils/syncToUrl';
import settings from 'project/settings.yml';
import _ from 'lodash';

const mainCard = [{ title: 'Card Mode', mode: 'card', tabIndex: 0}];
const landscapes = _.map(settings.big_picture, function(section) {
  return {
    title: section.name,
    mode: section.url,
    tabIndex: section.tab_index
  }
});
const cards = _.orderBy(mainCard.concat(landscapes), 'tabIndex').map( item => _.pick(item, ['title', 'mode']));

const mapStateToProps = (state) => ({
  mainContentMode: state.main.mainContentMode,
  cards: cards.map( (card) => ({ ...card, url: filtersToUrl({filters: state.main.filters, grouping: state.main.grouping, sortField: state.main.sortField, mainContentMode: card.mode})})),
});
const mapDispatchToProps = {
  changeMainContentMode: changeMainContentMode
};

export default connect(mapStateToProps, mapDispatchToProps)(SwitchButton);

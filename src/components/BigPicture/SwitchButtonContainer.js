import { connect } from 'react-redux';
import SwitchButton from './SwitchButton';
import { changeMainContentMode } from '../../reducers/mainReducer.js';
import { filtersToUrl } from '../../utils/syncToUrl';
import settings from 'project/settings.yml';

const mainCard = [{ title: 'Card Mode', mode: 'card'}];
const landscapes = _.map(settings.big_picture, function(section) {
  return {
    title: section.name,
    mode: section.url
  }
});
const cards = mainCard.concat(landscapes);

const mapStateToProps = (state) => ({
  mainContentMode: state.main.mainContentMode,
  cards: cards.map( (card) => ({ ...card, url: filtersToUrl({filters: state.main.filters, grouping: state.main.grouping, sortField: state.main.sortField, mainContentMode: card.mode})})),
});
const mapDispatchToProps = {
  changeMainContentMode: changeMainContentMode
};

export default connect(mapStateToProps, mapDispatchToProps)(SwitchButton);

import SwitchButton from './SwitchButton';
import { changeMainContentMode } from '../../reducers/mainReducer.js';
import { filtersToUrl } from '../../utils/syncToUrl';
import settings from '../../utils/settings.js'
import _ from 'lodash';
import { useContext } from 'react'
import RootContext from '../../contexts/RootContext'

const mainCard = [{shortTitle: 'Card', title: 'Card Mode', mode: 'card', tabIndex: 0}];

const landscapes = _.map(settings.big_picture, function(section) {
  return {
    title: section.name,
    shortTitle: section.short_name,
    mode: section.url,
    tabIndex: section.tab_index
  }
});

const _cards = _.orderBy(mainCard.concat(landscapes), 'tabIndex').map( item => _.pick(item, ['title', 'mode', 'shortTitle']));

const SwitchButtonContainer = () => {
  const { params } = useContext(RootContext)
  const { mainContentMode, filters, grouping, sortField } = params
  const cards = _cards.map(card => ({ ...card, url: filtersToUrl({filters, grouping, sortField, mainContentMode: card.mode})}))

  return <SwitchButton changeMainContentMode={changeMainContentMode} mainContentMode={mainContentMode} cards={cards}/>
}

export default SwitchButtonContainer

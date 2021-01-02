import React, { useContext } from 'react';
import { pure, withProps, toClass } from 'recompose';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import InternalLink from '../InternalLink';
import RootContext from '../../contexts/RootContext'
import EntriesContext from '../../contexts/EntriesContext'
import _ from 'lodash'
import settings from 'project/settings.yml';
import paramsToRoute from '../../utils/paramsToRoute'

const mainCard = [{shortTitle: 'Card', title: 'Card Mode', mode: 'card-mode', tabIndex: 0}]

const landscapes = _.map(settings.big_picture, function(section) {
  return {
    title: section.name,
    shortTitle: section.short_name,
    mode: section.url,
    tabIndex: section.tab_index
  }
})

const _cards = _.orderBy(mainCard.concat(landscapes), 'tabIndex').map( item => _.pick(item, ['title', 'mode', 'shortTitle']))

const SwitchButton = _ => {
  const { params } = useContext(RootContext)
  const { navigate } = useContext(EntriesContext)
  const { mainContentMode, isEmbed } = params
  const cards = _cards.map(card => ({ ...card, url: paramsToRoute({ ...params, mainContentMode: card.mode })}))

  if (isEmbed) {
    return null;
  }
  return [
    <Tabs
          className="big-picture-switch big-picture-switch-normal"
          value={mainContentMode}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_event, mainContentMode) => navigate({ mainContentMode })}
          key='tabs'
        >
          { cards.map(({ mode, title, url}) => {
            const link = toClass(withProps(props => { return { to: url } })(InternalLink));
            return <Tab key={mode} label={title} component={link} value={mode} />
          })}
    </Tabs>
  ]


}
export default pure(SwitchButton);

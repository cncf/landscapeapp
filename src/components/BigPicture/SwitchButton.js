import React from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import InternalLink from '../InternalLink';
import isEmbed from '../../utils/isEmbed';

const SwitchButton = function({mainContentMode, changeMainContentMode, cards}) {
  if (isEmbed) {
    return null;
  }
  return <Tabs
          className="big-picture-switch"
          value={mainContentMode}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_event, value) => changeMainContentMode(value)}
        >
          { cards.map(function(card) {
            return <Tab key={card.mode} label={card.title} component={(props) => <InternalLink to={card.url} {...props}></InternalLink>} value={card.mode} />
          }) }
        </Tabs>
}
export default SwitchButton;

import React from 'react';
import { pure } from 'recompose';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import InternalLink from '../InternalLink';
import isEmbed from '../../utils/isEmbed';
import TweetButton from '../TweetButton';

const SwitchButton = function({mainContentMode, changeMainContentMode, cards}) {
  if (isEmbed) {
    return null;
  }
  return [
    <Tabs
          className="big-picture-switch big-picture-switch-normal"
          value={mainContentMode}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_event, value) => changeMainContentMode(value)}
        >
          { cards.map(function(card) {
            return <Tab key={card.mode} label={card.title} component={(props) => <InternalLink to={card.url} {...props}></InternalLink>} value={card.mode} />
          }).concat(<TweetButton cls="tweet-button-main" />) }
    </Tabs>,
    <Tabs
          className="big-picture-switch big-picture-switch-short"
          value={mainContentMode}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_event, value) => changeMainContentMode(value)}
        >
          { cards.map(function(card) {
            return <Tab key={card.mode} label={card.shortTitle || card.title} component={(props) => <InternalLink to={card.url} {...props}></InternalLink>} value={card.mode} />
          }).concat(<TweetButton cls="tweet-button-main" />) }
    </Tabs>,
  ]


}
export default pure(SwitchButton);

import React from 'react';
import { pure, withProps, toClass } from 'recompose';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import InternalLink from '../InternalLink';
import isEmbed from '../../utils/isEmbed';

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

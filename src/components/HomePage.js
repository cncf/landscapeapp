import React from 'react';
import { pure } from 'recompose';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import classNames from 'classnames'
import Filters from './Filters';
import Grouping from './Grouping';
import Sorting from './Sorting';
import PresetsContainer from './PresetsContainer';
import Ad from './Ad';
import AutoSizer from './CustomAutoSizer';
import {
  MainLandscapeContentContainer,
  ExtraLandscapeContentContainer,
  ThirdLandscapeContentContainer,
  SwitchButtonContainer,
  ZoomButtonsContainer,
  FullscreenButtonContainer
} from './BigPicture';
import TweetButton from './TweetButton';
import MainContentContainer from './MainContentContainer';
import HomePageUrlContainer from './HomePageUrlContainer';
import HomePageScrollerContainer from './HomePageScrollerContainer';
import ResetFiltersContainer from './ResetFiltersContainer';
import ItemDialogContainer from './ItemDialogContainer';
import ItemDialogButtonsContainer from './ItemDialogButtonsContainer';
import HeaderContainer from './HeaderContainer';
import SummaryContainer from './SummaryContainer';
import ExportCsvContainer from './ExportCsvContainer';
import Footer from './Footer';
import EmbeddedFooter from './EmbeddedFooter';

import isIphone from '../utils/isIphone';
import isMobile from '../utils/isMobile';
import isDesktop from '../utils/isDesktop';
import isGoogle from '../utils/isGoogle';
import bus from '../reducers/bus';
import settings from 'project/settings.yml'

const mainSettings = settings.big_picture.main;
const extraSettings = settings.big_picture.extra || {};
const thirdSettings = settings.big_picture.third || {};

const state = {
  lastScrollPosition: 0
};

bus.on('scrollToTop', function() {
  (document.scrollingElement || document.body).scrollTop = 0;
});


const HomePage = ({isEmbed, mainContentMode, ready, hasSelectedItem, filtersVisible, hideFilters, showFilters, onClose, title, isFullscreen}) => {
  const isBigPicture = mainContentMode !== 'card';
  if (!ready) {
    return (
      <div>
        <HomePageUrlContainer />
      </div>
    )
  }
  document.title = title;
  if (isGoogle && hasSelectedItem) {
    return <ItemDialogContainer />;
  }

  if (isBigPicture) {
    document.querySelector('html').classList.add('big-picture');
  } else {
    document.querySelector('html').classList.remove('big-picture');
  }

  if (isFullscreen) {
    document.querySelector('html').classList.add('fullscreen');
  } else {
    document.querySelector('html').classList.remove('fullscreen');
  }

  if (isIphone) {
    if (hasSelectedItem) {
      if (!document.querySelector('.iphone-scroller')) {
        state.lastScrollPosition = (document.scrollingElement || document.body).scrollTop;
      }
      document.querySelector('html').classList.add('has-selected-item');
      (document.scrollingElement || document.body).scrollTop = 0;
    } else {
      document.querySelector('html').classList.remove('has-selected-item');
      if (document.querySelector('.iphone-scroller')) {
        (document.scrollingElement || document.body).scrollTop = state.lastScrollPosition;
      }
    }
    //try to get a current scroll if we are in a normal mode
  }

  if (isEmbed) {
    if (window.parentIFrame) {
      if (hasSelectedItem) {
        window.parentIFrame.sendMessage({type: 'showModal'})
      } else {
        window.parentIFrame.sendMessage({type: 'hideModal'})
      }
      if (hasSelectedItem) {
        window.parentIFrame.getPageInfo(function(info) {
          var offset = info.scrollTop - info.offsetTop;
          var height = info.iframeHeight - info.clientHeight;
          var maxHeight = info.clientHeight * 0.9;
          if (maxHeight > 480) {
            maxHeight = 480;
          }
          var t = function(x1, y1, x2, y2, x3) {
            if (x3 < x1 - 50) {
              x3 = x1 - 50;
            }
            if (x3 > x2 + 50) {
              x3 = x2 + 50;
            }
            return y1 + (x3 - x1) / (x2 - x1) * (y2 - y1);
          }
          var top = t(0, -height, height, height, offset);
          if (top < 0 && info.iframeHeight <= 600) {
            top = 10;
          }
          setTimeout(function() {
            const modal = document.querySelector('.modal-body');
            if (modal) {
              modal.style.top = top + 'px';
              modal.style.maxHeight = maxHeight + 'px';
            }
          }, 10);
        });
      }
    }
    document.querySelector('body').classList.add('embed');
  }

  function handleShadowClick(e) {
    if (!(isIphone && hasSelectedItem)) {
      return;
    }
    if (window.matchMedia("(orientation: portrait)").matches) {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      const marginX = 0.125;
      const marginY = 0.06;
      if ( x > marginX && x < 1 - marginX && y > marginY && y < 1 - marginY ) {
        console.info('a click inside the mask, ignoring');
      } else {
        onClose();
      }
    }
    if (window.matchMedia("(orientation: landscape)").matches) {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      const marginX = 0.07;
      const marginY = 0.1;
      if ( x > marginX && x < 1 - marginX && y > marginY) {
        console.info('a click inside the mask, ignoring');
      } else {
        onClose();
      }
    }
  }

  const hideTopPart = isEmbed || isFullscreen || (isMobile && isBigPicture);

  return (
    <div onClick={handleShadowClick} >
    <HomePageScrollerContainer/>
    <ItemDialogContainer/>
    { isIphone && <ItemDialogButtonsContainer/> }
    <div className={classNames('app',{'filters-opened' : filtersVisible, 'background': isIphone && hasSelectedItem})}>
      <div className={classNames({"shadow": isIphone && hasSelectedItem})} />
      <div style={{marginTop: (isIphone && hasSelectedItem) ? -state.lastScrollPosition : 0}} className={classNames({"iphone-scroller": isIphone && hasSelectedItem}, 'main-parent')} >
        { !isEmbed && !isFullscreen && <HeaderContainer/> }
        { !isEmbed && !isFullscreen && <IconButton className="sidebar-show" onClick={showFilters}><MenuIcon /></IconButton> }
        { !isEmbed && !isFullscreen && <div className="sidebar">
          <div className="sidebar-scroll">
            <IconButton className="sidebar-collapse" onClick={hideFilters}><CloseIcon /></IconButton>
            <ResetFiltersContainer />
            <Grouping/>
            <Sorting/>
            <Filters />
            <PresetsContainer />
            <ExportCsvContainer />
            <Ad />
          </div>
        </div>
        }

        <div className="app-overlay" onClick={hideFilters}></div>

        <HomePageUrlContainer />

        <div className={classNames('main', {'embed': isEmbed})}>
          { isMobile && <SwitchButtonContainer /> }
          { !hideTopPart && <div className="disclaimer">
            <span  dangerouslySetInnerHTML={{__html: settings.home.header}} />
            Please <a target="_blank" href={`https://github.com/${settings.global.repo}`}>open</a> a pull request to
            correct any issues. Greyed logos are not open source. Last Updated: {window.lastUpdated}
          </div> }
          { !hideTopPart && <SummaryContainer /> }
          { !isMobile && <SwitchButtonContainer /> }
          { isBigPicture &&
              <AutoSizer>
                {({ height, width }) => (
                  <div style={{minWidth: (isDesktop ? 560 : undefined), width:width, height: height, position: 'relative', background: 'rgb(134,175,188)'}}>
                    <ZoomButtonsContainer />
                    <FullscreenButtonContainer />
                    <TweetButton cls="tweet-button-main" />
                    <div style={{width: '100%', height: '100%', position: 'relative', overflow: 'scroll', padding: 10}}>
                      { mainContentMode === mainSettings.url && <MainLandscapeContentContainer /> }
                      { mainContentMode === extraSettings.url && <ExtraLandscapeContentContainer /> }
                      { mainContentMode === thirdSettings.url && <ThirdLandscapeContentContainer /> }
                    </div>
                  </div>
                )}
              </AutoSizer>

          }
          { !isBigPicture && <MainContentContainer/> }
          { !isEmbed && !isBigPicture && <Footer/> }
          { isEmbed && <EmbeddedFooter/> }
        </div>
      </div>
    </div>
    </div>
  );
};

export default pure(HomePage);

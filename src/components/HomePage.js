import React, { useContext, useState } from 'react';
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
import OutboundLink from './OutboundLink';
import {
  SwitchButtonContainer,
} from './BigPicture';
import TweetButton from './TweetButton';
import MainContentContainer from './MainContentContainer';
import ExportCsvContainer from './ExportCsvContainer';
import Footer from './Footer';
import EmbeddedFooter from './EmbeddedFooter';

import isGoogle from '../utils/isGoogle';
import bus from '../reducers/bus';
import settings from '../utils/settings.js'
import isModalOnly from "../utils/isModalOnly";
import currentDevice from '../utils/currentDevice'
import isBrowser from '../utils/isBrowser'
import LandscapeContent from './BigPicture/LandscapeContent'
import { findLandscapeSettings } from '../utils/landscapeSettings'
import { getGroupedItemsForBigPicture } from '../utils/itemsCalculator'
import RootContext from '../contexts/RootContext'
import EntriesContext from '../contexts/EntriesContext'
import ResetFilters from './ResetFilters'
import ItemDialog from './ItemDialog'
import ZoomButtons from './BigPicture/ZoomButtons'
import Summary from './Summary'
import FullscreenButton from './BigPicture/FullscreenButton'
import Header from './Header'

const state = {
  lastScrollPosition: 0
};

bus.on('scrollToTop', function() {
  (document.scrollingElement || document.body).scrollTop = 0;
});

function preventDefault(e){
  const modal = e.srcElement.closest('.modal-body');
  if (!modal) {
    e.preventDefault();
  }
}

function disableScroll(){
  const shadow = document.querySelector('.MuiBackdrop-root');
  if (shadow) {
    shadow.addEventListener('touchmove', preventDefault, { passive: false });
  }
  document.body.addEventListener('touchmove', preventDefault, { passive: false });
}

function enableScroll(){
  const shadow = document.querySelector('.MuiBackdrop-root');
  if (shadow) {
    shadow.removeEventListener('touchmove', preventDefault);
  }
  document.body.removeEventListener('touchmove', preventDefault);
}

const HomePage = _ => {
  const { params } = useContext(RootContext)
  const { entries, selectedItem } = useContext(EntriesContext)
  const { mainContentMode, zoom, isFullscreen, isEmbed } = params
  const landscapeSettings = findLandscapeSettings(mainContentMode)
  const groupedItems = getGroupedItemsForBigPicture(params, entries, landscapeSettings)
  const isBigPicture = mainContentMode !== 'card-mode';
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const showSidebar = _ => setSidebarVisible(true)
  const hideSidebar = _ => setSidebarVisible(false)

  if (isModalOnly()) {
    document.querySelector('body').classList.add('popup');
  }

  if ((isGoogle() || isModalOnly()) && selectedItem) {
    return <ItemDialog />;
  }

  if (isBrowser()) {
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
  }

  if (isBrowser() && currentDevice.ios()) {
    if (hasSelectedItem) {
      if (!document.querySelector('.iphone-scroller')) {
        state.lastScrollPosition = (document.scrollingElement || document.body).scrollTop;
      }
      document.querySelector('html').classList.add('has-selected-item');
      (document.scrollingElement || document.body).scrollTop = 0;
      disableScroll();
    } else {
      document.querySelector('html').classList.remove('has-selected-item');
      if (document.querySelector('.iphone-scroller')) {
        (document.scrollingElement || document.body).scrollTop = state.lastScrollPosition;
      }
      enableScroll();
    }
  }

  if (isBrowser() && isEmbed) {
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

  const isIphone = isBrowser() && currentDevice.ios()

  return (
    <div>
    {selectedItem && <ItemDialog/>}
    <div className={classNames('app',{'filters-opened' : sidebarVisible})}>
      <div />
      <div style={{marginTop: (isIphone && hasSelectedItem) ? -state.lastScrollPosition : 0}} className={classNames({"iphone-scroller": isIphone && hasSelectedItem}, 'main-parent')} >
        { !isEmbed && !isFullscreen && <Header /> }
        { !isEmbed && !isFullscreen && <IconButton className="sidebar-show" title="Show sidebar" onClick={showSidebar}><MenuIcon /></IconButton> }
        { !isEmbed && !isFullscreen && <div className="sidebar">
          <div className="sidebar-scroll">
            <IconButton className="sidebar-collapse" title="Hide sidebar" onClick={hideSidebar}><CloseIcon /></IconButton>
            <ResetFilters />
            <Grouping/>
            <Sorting/>
            <Filters />
            <PresetsContainer />
            <ExportCsvContainer />
            <Ad />
          </div>
        </div>
        }

        <div className="app-overlay" onClick={hideSidebar}></div>

        <div className={classNames('main', {'embed': isEmbed})}>
          { !isEmbed && <div className="disclaimer">
            <span  dangerouslySetInnerHTML={{__html: settings.home.header}} />
            Please <OutboundLink to={`https://github.com/${settings.global.repo}`}>open</OutboundLink> a pull request to
            correct any issues. Greyed logos are not open source. Last Updated: {process.env.lastUpdated}
          </div> }
          { !isEmbed && <Summary /> }

          <div className="cards-section">
            <SwitchButtonContainer />
            <div className="right-buttons">
              <ZoomButtons/>
              <FullscreenButton/>
              <TweetButton cls="tweet-button-main"/>
            </div>
            { isBigPicture &&
            <AutoSizer>
              {({ height }) => (
                <div className="landscape-wrapper" style={{height: height}}>
                  <LandscapeContent zoom={zoom} groupedItems={groupedItems} landscapeSettings={landscapeSettings} />
                </div>
              )}
            </AutoSizer>
            }
            { !isBigPicture && <MainContentContainer/> }
          </div>
          { !isEmbed && !isBigPicture && <Footer/> }
          { isEmbed && <EmbeddedFooter/> }
        </div>
      </div>
    </div>
    </div>
  );
};

export default pure(HomePage);

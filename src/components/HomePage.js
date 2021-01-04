import React, { useContext, useEffect, useState } from 'react';
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
import TweetButton from './TweetButton';
import MainContentContainer from './MainContentContainer';
import Footer from './Footer';
import EmbeddedFooter from './EmbeddedFooter';

import isGoogle from '../utils/isGoogle';
import bus from '../reducers/bus';
import settings from 'project/settings.yml'
import isModalOnly from "../utils/isModalOnly";
import currentDevice from '../utils/currentDevice'
import isBrowser from '../utils/isBrowser'
import LandscapeContent from './BigPicture/LandscapeContent'
import EntriesContext from '../contexts/EntriesContext'
import ResetFilters from './ResetFilters'
import ItemDialog from './ItemDialog'
import ZoomButtons from './BigPicture/ZoomButtons'
import Summary from './Summary'
import FullscreenButton from './BigPicture/FullscreenButton'
import Header from './Header'
import SwitchButton from './BigPicture/SwitchButton'
import ExportCsv from './ExportCsv'

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
  const { selectedItem, params } = useContext(EntriesContext)
  const { mainContentMode, zoom, isFullscreen, isEmbed } = params
  const isBigPicture = mainContentMode !== 'card-mode';
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const showSidebar = _ => setSidebarVisible(true)
  const hideSidebar = _ => setSidebarVisible(false)
  const [lastScrollPosition, setLastScrollPosition] = useState(0)

  if (isModalOnly()) {
    document.querySelector('body').classList.add('popup');
  }

  if ((isGoogle() || isModalOnly() || !isBrowser()) && selectedItem) {
    return <ItemDialog />;
  }

  useEffect(_ => {
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

    if (currentDevice.ios()) {
      if (selectedItem) {
        if (!document.querySelector('.iphone-scroller')) {
          setLastScrollPosition((document.scrollingElement || document.body).scrollTop)
        }
        document.querySelector('html').classList.add('has-selected-item');
        (document.scrollingElement || document.body).scrollTop = 0;
        disableScroll();
      } else {
        document.querySelector('html').classList.remove('has-selected-item');
        if (document.querySelector('.iphone-scroller')) {
          (document.scrollingElement || document.body).scrollTop = lastScrollPosition;
        }
        enableScroll();
      }
    }

    if (isEmbed) {
      if (window.parentIFrame) {
        if (selectedItem) {
          window.parentIFrame.sendMessage({type: 'showModal'})
        } else {
          window.parentIFrame.sendMessage({type: 'hideModal'})
        }
        if (selectedItem) {
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
  }, [])

  const isIphone = isBrowser() && currentDevice.ios()

  return (
    <div>
    {selectedItem && <ItemDialog/>}
    <div className={classNames('app',{'filters-opened' : sidebarVisible})}>
      <div style={{marginTop: isIphone && selectedItem ? -lastScrollPosition : 0}} className={classNames({"iphone-scroller": isIphone && selectedItem}, 'main-parent')} >
        { !isEmbed && !isFullscreen && <>
          <Header />
          <IconButton className="sidebar-show" title="Show sidebar" onClick={showSidebar}><MenuIcon /></IconButton>
          <div className="sidebar">
            <div className="sidebar-scroll">
              <IconButton className="sidebar-collapse" title="Hide sidebar" onClick={hideSidebar}><CloseIcon /></IconButton>
              <ResetFilters />
              <Grouping/>
              <Sorting/>
              <Filters />
              <PresetsContainer />
              <ExportCsv />
              <Ad />
            </div>
          </div>
        </>}

        {sidebarVisible && <div className="app-overlay" onClick={hideSidebar}></div>}

        <div className={classNames('main', {'embed': isEmbed})}>
          { !isEmbed && <div className="disclaimer">
            <span  dangerouslySetInnerHTML={{__html: settings.home.header}} />
            Please <OutboundLink to={`https://github.com/${settings.global.repo}`}>open</OutboundLink> a pull request to
            correct any issues. Greyed logos are not open source. Last Updated: {process.env.lastUpdated}
          </div> }
          { !isEmbed && <Summary /> }

          <div className="cards-section">
            <SwitchButton />
            <div className="right-buttons">
              <ZoomButtons/>
              <FullscreenButton/>
              <TweetButton cls="tweet-button-main"/>
            </div>
            { isBigPicture &&
            <AutoSizer>
              {({ height }) => (
                <div className="landscape-wrapper" style={{height: height}}>
                  <LandscapeContent zoom={zoom} />
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

import React, { useContext, useEffect, useState } from 'react';
import Head from 'next/head'
import { pure } from 'recompose';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import classNames from 'classnames'
import Filters from './Filters';
import Grouping from './Grouping';
import Sorting from './Sorting';
import Ad from './Ad';
import OutboundLink from './OutboundLink';
import TweetButton from './TweetButton';
import Footer from './Footer';
import EmbeddedFooter from './EmbeddedFooter';

import isGoogle from '../utils/isGoogle';
import settings from 'public/settings.json'
import useCurrentDevice from '../utils/useCurrentDevice'
import LandscapeContent from './BigPicture/LandscapeContent'
import LandscapeContext from '../contexts/LandscapeContext'
import ResetFilters from './ResetFilters'
import ItemDialog from './ItemDialog'
import ZoomButtons from './BigPicture/ZoomButtons'
import Summary from './Summary'
import FullscreenButton from './BigPicture/FullscreenButton'
import Header from './Header'
import SwitchButton from './BigPicture/SwitchButton'
import ExportCsv from './ExportCsv'
import MainContent from './MainContent'
import Presets from './Presets'
import GuideToggle from './GuideToggle'

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
  const { params, landscapeSettings } = useContext(LandscapeContext)
  const { mainContentMode, zoom, isFullscreen, isEmbed, onlyModal, selectedItemId } = params
  const isBigPicture = mainContentMode !== 'card-mode';
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const showSidebar = _ => setSidebarVisible(true)
  const hideSidebar = _ => setSidebarVisible(false)
  const [lastScrollPosition, setLastScrollPosition] = useState(0)
  const currentDevice = useCurrentDevice()

  if (onlyModal) {
    document.querySelector('body').classList.add('popup');
  }

  useEffect(() => {
    const { classList } = document.querySelector('html')
    isFullscreen ? classList.add('fullscreen') : classList.remove('fullscreen')
  }, [isFullscreen])

  useEffect(() => {
    if (currentDevice.ios()) {
      if (selectedItemId) {
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
  }, [currentDevice, selectedItemId])

  useEffect(() => {
    if (isEmbed) {
      if (window.parentIFrame) {
        if (selectedItemId) {
          window.parentIFrame.sendMessage({type: 'showModal'})
        } else {
          window.parentIFrame.sendMessage({type: 'hideModal'})
        }
        if (selectedItemId) {
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

      const { classList } = document.documentElement
      if (!classList.contains('embed')) {
        classList.add('embed');
      }
    }
  }, [selectedItemId])

  if ((isGoogle() || onlyModal) && selectedItemId) {
    return <ItemDialog />;
  }

  const isIphone = currentDevice.ios()
  const titlePrefix = isBigPicture ? (landscapeSettings.isMain ? '' : landscapeSettings.name) : 'Card Mode'
  const title = [titlePrefix, settings.global.meta.title].filter(_ => _).join(' - ')

  return <>
    {selectedItemId && <ItemDialog/>}
    <Head>
      <title>{title}</title>
      <meta property="og:title" content={title}/>
    </Head>
    <div id="home" className={classNames('app',{'filters-opened' : sidebarVisible, 'big-picture': isBigPicture })}>
      <div style={{marginTop: isIphone && selectedItemId ? -lastScrollPosition : 0}} className={classNames({"iphone-scroller": isIphone && selectedItemId}, 'main-parent')} >
        { !isEmbed && !isFullscreen && <>
          <Header />
          <IconButton className="sidebar-show" title="Show sidebar" onClick={showSidebar}><MenuIcon /></IconButton>
          <div className="sidebar">
            <div className="sidebar-scroll">
              <IconButton className="sidebar-collapse" title="Hide sidebar" size="small" onClick={hideSidebar}><CloseIcon /></IconButton>
              <GuideToggle active="landscape"/>
              <ResetFilters />
              <Grouping/>
              <Sorting/>
              <Filters />
              <Presets />
              <ExportCsv />
              <Ad />
            </div>
          </div>
        </>}

        {sidebarVisible && <div className="app-overlay" onClick={hideSidebar}></div>}

        <div className={classNames('main', {'embed': isEmbed})}>
          <div className="disclaimer">
            <span  dangerouslySetInnerHTML={{__html: settings.home.header}} />
            Please <OutboundLink to={`https://github.com/${settings.global.repo}`}>open</OutboundLink> a pull request to
            correct any issues. Greyed logos are not open source. Last Updated: {process.env.lastUpdated}
          </div>
          <Summary />

          <div className="cards-section">
            <SwitchButton />
            <div className="right-buttons">
              <TweetButton cls="tweet-button-main"/>
              <FullscreenButton/>
              <ZoomButtons/>
            </div>
            { isBigPicture &&
              <div className="landscape-flex">
                <div className="landscape-wrapper">
                  <LandscapeContent zoom={zoom} />
                </div>
              </div>
            }
            { !isBigPicture && <MainContent /> }
          </div>
          { !isEmbed && !isBigPicture && <Footer/> }
          { isEmbed && <EmbeddedFooter/> }
        </div>
      </div>
    </div>
  </>
};

export default pure(HomePage);

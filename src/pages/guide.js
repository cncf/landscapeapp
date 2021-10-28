import React, { Fragment, useEffect, useState } from 'react'
import { existsSync, readFileSync } from 'fs'
import Typography from '@material-ui/core/Typography'
import classNames from 'classnames'
import MenuIcon from '@material-ui/icons/Menu'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import ArrowRightIcon from '@material-ui/icons/ArrowRight'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import assetPath from '../utils/assetPath'
import { LandscapeProvider } from '../contexts/LandscapeContext'
import { parseParams } from '../utils/routing'
import getPrerenderProps from '../utils/getPrerenderProps'
import Item from '../components/BigPicture/Item'
import { findLandscapeSettings } from '../utils/landscapeSettings'
import { isLargeFn, itemMargin, smallItemHeight, smallItemWidth } from '../utils/landscapeCalculations'
import settings from 'public/settings.json'
import ItemDialog from '../components/ItemDialog'
import GuideToggle from '../components/GuideToggle'
import LandscapeLogo from '../components/LandscapeLogo'
import OrganizationLogo from '../OrganizationLogo'
import NotFoundPage from './404'

const scale = 1.8;

const SubcategoryMetadata = ({ node, entries }) => {
  const projectEntries = entries.filter(entry => entry.project)
  return <>
    <style jsx>{`
      .items {
        grid-template-columns: repeat(auto-fill, ${scale * smallItemWidth}px);
        grid-auto-rows: ${scale * smallItemHeight}px;
        gap: ${scale * itemMargin}px;
      }

      .items :global(.item) {
        transform: scale(${scale});
      }
    `}</style>
    { (node.buzzwords.length > 0 || projectEntries.length > 0) &&  <div className="metadata">
      <div className="header">
        <div>Buzzwords</div>
        <div>{settings.global.short_name} Projects</div>
      </div>
      <div className="body">
        <div>
          <ul>
            { node.buzzwords.map(str => <li key={str}>{str}</li>) }
          </ul>
        </div>
        <div>
          <ul>
            { projectEntries.map(entry => <li key={entry.name}>{entry.name} ({entry.project})</li>) }
          </ul>
        </div>
      </div>
    </div> }

    <div className="items">
      { entries.map(entry => <Item item={entry} key={entry.id} />) }
    </div>
  </>
}

const SidebarLink = ({ anchor, level, className, children, ...extra }) => {
  const paddingLeft = 20 + (level - 1) * 10

  return <Link href={`#${anchor}`} prefetch={false}>
    <a className={`sidebar-link ${className}`} style={{ paddingLeft }} {...extra}>
      { children }
    </a>
  </Link>
}

const Navigation = ({ nodes, hideSidebar }) => {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const currentSection = isReady && router.asPath.split('#')[1] || ''
  const links = nodes.filter(node => node.anchor)
  const currentLevel = (links.find(node => node.anchor === currentSection) || {}).level || 0
  const visibleSections = currentSection.split('--').slice(0, Math.max(currentLevel - 1, 1)).join('--')

  useEffect(() => setIsReady(true), [])

  const parents = links
    .map(n => n.anchor.split('--')[0])
    .reduce((acc, n) => ({ ...acc, [n]: (acc[n] || 0) + 1}), {})

  return links
    .filter(({ title, level, anchor }) => {
      return title && (level === 1 || (currentLevel + 1 >= level && anchor.indexOf(visibleSections) === 0))
    })
    .map(node => {
      const hasChildren = (parents[node.anchor] || 0) > 1
      const isExpanded = hasChildren && currentSection && currentSection.indexOf(node.anchor) === 0
      const activeClass = node.anchor === currentSection ? 'active' : ''
      const expandableClass = `expandable ${isExpanded ? 'expanded' : ''}`
      const className = hasChildren ? expandableClass : activeClass
      const extra = hasChildren ? {} : { onClick: hideSidebar }

      return <Fragment key={node.anchor}>
        <SidebarLink className={className} anchor={node.anchor} level={node.level} {...extra}>
          {node.title} {hasChildren && <ArrowRightIcon/>}
        </SidebarLink>

        {isExpanded && <SidebarLink className={activeClass} anchor={node.anchor} level={node.level + 1} onClick={hideSidebar}>
          Overview
        </SidebarLink>}
      </Fragment>
  })
}

const LandscapeLink = ({ landscapeKey, title }) => {
  const href = assetPath(`/card-mode?category=${landscapeKey}`)

  return <a href={href} target="_blank" className="permalink">
    <span className="guide-icon" />{title}
  </a>
}

const Content = ({ nodes, enhancedEntries }) => {
  return nodes.map((node, idx) => {
    const subcategoryEntries = node.subcategory && enhancedEntries.filter(entry => entry.path.split(' / ')[1].trim() === node.title)

    return <div key={idx}>
      { node.title && <div className="section-title" id={node.anchor}>
        <Typography variant={`h${node.level + 1}`}>
          { node.landscapeKey ?
            <LandscapeLink landscapeKey={node.landscapeKey} title={node.title} /> :
            node.title }
        </Typography>
      </div>}
      { node.content && <div className="guide-content" dangerouslySetInnerHTML={{ __html: node.content }} /> }
      { node.subcategory && <SubcategoryMetadata entries={subcategoryEntries} node={node} /> }
    </div>
  })
}

const Title = () => {
  return <Typography variant="h1" className="title">
    {settings.global.short_name} Landscape Guide
  </Typography>
}

// We need to wait until fonts are loaded before measuring text width
// In theory document.fonts.ready should work but it does not on Safari
const waitForFonts = callback => {
  if (document.fonts.status === 'loaded') {
    callback()
  } else {
    setTimeout(() => waitForFonts(callback), 50)
  }
}

const GuidePage = ({ content, title, entries, mainContentMode, missing, setNotice }) => {
  if (missing) {
    return <NotFoundPage setNotice={setNotice} />
  }

  useEffect(() => {
    // This is a hack to prevent layout shifts when hovering over links,
    // given links are bold on hover.
    waitForFonts(() => {
      const links = document.querySelectorAll('a')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const measureTextWidth = (text, font) => {
        ctx.font = font
        return ctx.measureText(text).width
      }

      links.forEach(linkEl => {
        linkEl.style.letterSpacing = null
        const { fontSize, fontFamily, letterSpacing } = window.getComputedStyle(linkEl)
        const textWidth = measureTextWidth(linkEl.text, `${fontSize} ${fontFamily}`)
        const hoverWidth = measureTextWidth(linkEl.text, `bold ${fontSize} ${fontFamily}`)
        const letterSpacingNum = parseFloat(letterSpacing) || 0
        linkEl.style.letterSpacing = `${letterSpacingNum + (hoverWidth - textWidth) / (linkEl.text.length - 1)}px`
      })
    })
  })

  const router = useRouter()
  const selectedItemId = router.query.selected

  const landscapeSettings = findLandscapeSettings(mainContentMode)
  const categories = landscapeSettings.elements.map(element => element).reduce((acc, category) => {
    return { ...acc, [category.category]: category }
  }, {})

  const enhancedEntries = entries.map(entry => {
    const categoryAttrs = categories[entry.category]
    const enhanced = { ...entry, categoryAttrs, isVisible: true }
    return { ...enhanced, isLarge: isLargeFn(enhanced) }
  })

  const [sidebarVisible, setSidebarVisible] = useState(false)
  const toggleSidebar = visible => {
    const { classList } = document.body
    visible ? classList.add('no-scroll-mobile') : classList.remove('no-scroll-mobile')
    setSidebarVisible(visible)
  }
  const showSidebar = _ => toggleSidebar(true)
  const hideSidebar = _ => toggleSidebar(false)

  return <LandscapeProvider entries={entries} pageParams={{ mainContentMode }}>
    <Head>
      <title>Guide - {title}</title>
      <meta property="og:title" content={`Guide - ${title}`}/>
    </Head>

    {selectedItemId && <ItemDialog/>}

    <div id="guide-page" className={classNames('app',{'sidebar-open' : sidebarVisible})}>
      <div className="side-content">
        <LandscapeLogo />
        <div className="guide-sidebar">
          <IconButton className="sidebar-collapse" title="Hide sidebar" size="small" onClick={hideSidebar}>
            <CloseIcon />
          </IconButton>
          <GuideToggle active="guide" />
          <Navigation nodes={content} hideSidebar={hideSidebar} />
        </div>
      </div>

      <div className="guide-header">
        <div className="container">
          <div className="content">
            <div className="sidebar-show">
              <IconButton title="Show sidebar" onClick={showSidebar}><MenuIcon  /></IconButton>
            </div>

            <LandscapeLogo />
            <Title />
          </div>
        </div>

        <OrganizationLogo />
      </div>

      <div className="main-content">
        <div className="container">
          <div className="content">
            <Title />

            <Content nodes={content} enhancedEntries={enhancedEntries} />
          </div>
        </div>
      </div>
    </div>
  </LandscapeProvider>
}

export async function getStaticProps() {
  const notFound = !existsSync('public/guide.json')
  const content = notFound ? [] : JSON.parse(readFileSync('public/guide.json', 'utf-8'))
  const settings = JSON.parse(require('fs').readFileSync('public/settings.json', 'utf-8'))
  const mainContentMode = 'guide'
  const params = parseParams({ mainContentMode })
  const { entries } = getPrerenderProps(params)
  const props = { content, mainContentMode, entries, title: settings.global.meta.title, missing: notFound }
  return { props }
}

export default GuidePage

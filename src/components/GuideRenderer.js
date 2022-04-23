import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { isLargeFn } from '../utils/landscapeCalculations'
import Item from './Item.js'



// landscapeSettings should be a main page
// guide is a guide index
export function render({settings, landscapeSettings, guide, entries }) {
  const Title = () => <h1 className="title">{settings.global.short_name} Landscape Guide</h1>;
  const SubcategoryMetadata = ({ node, entries }) => {
    const projectEntries = entries.filter(entry => entry.project)
    return <>
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

  const SidebarLink = ({ anchor, level, className = "", children }) => {
    const paddingLeft = 20 + (level - 1) * 10;
    return <a href={`#${anchor}`} data-level={level} className={`sidebar-link ${className}`} style={{ paddingLeft }}>
      { children }
      </a>;
  }

  const Navigation = ({ nodes }) => {
    const links = nodes.filter(node => node.anchor)
    const parents = links
      .map(n => n.anchor.split('--')[0])
      .reduce((acc, n) => ({ ...acc, [n]: (acc[n] || 0) + 1}), {})

    return links
      .filter(({ title, level, anchor }) => {
        return title
      })
      .map(node => {
        const hasChildren = (parents[node.anchor] || 0) > 1
        return <React.Fragment key={node.anchor}>
          <SidebarLink className="expandable" anchor={node.anchor} level={node.level}>
            {node.title} { hasChildren && <svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"></path></svg> }
          </SidebarLink>
        {hasChildren && <SidebarLink anchor={node.anchor} level={node.level + 1} >
          Overview
        </SidebarLink>}
        </React.Fragment>
      })
  }

  const LandscapeLink = ({ landscapeKey, title }) => {
    const guideIcon =
      <svg className="guide-icon" viewBox="0 0 18.78 23.66">
        <path d="M9.39,9.5a2.09,2.09,0,0,1,0-4.18,2.09,2.09,0,0,1,0,4.18Z"/>
        <path d="M3,19.7H17.75a1,1,0,0,0,1-1V1a1,1,0,0,0-1-1H1A1,1,0,0,0,0,1V20.64a3,3,0,0,0,3,3H17.75a1,1,0,1,0,0-2.05H3A1,1,0,0,1,3,19.7ZM9.39,2.9a4.52,4.52,0,0,1,4.5,4.51c0,1.76-2.29,6-3.61,8.27a1,1,0,0,1-1.79,0C7.18,13.41,4.88,9.17,4.88,7.41A4.52,4.52,0,0,1,9.39,2.9Z"/>
      </svg>
    const href = `card-mode?category=${landscapeKey}`
    return <a href={href} target="_blank" className="permalink">
      {guideIcon} {title}
    </a>
  }

  const Content = ({ nodes, enhancedEntries }) => {
    return nodes.map((node, idx) => {
      const subcategoryEntries = node.subcategory && enhancedEntries.filter(entry => entry.path.split(' / ')[1].trim() === node.title)

      return <div key={idx}>
        { node.title && <div className="section-title" id={node.anchor}>
          <h2 data-variant={node.level + 1}>
            { node.landscapeKey ?
              <LandscapeLink landscapeKey={node.landscapeKey} title={node.title} /> :
              node.title }
            </h2>
            </div>}
            { node.content && <div className="guide-content" dangerouslySetInnerHTML={{ __html: node.content }} /> }
            { node.subcategory && <SubcategoryMetadata entries={subcategoryEntries} node={node} /> }
          </div>
    })
  }
  const categories = landscapeSettings.elements.map(element => element).reduce((acc, category) => {
    return { ...acc, [category.category]: category }
  }, {})

  const enhancedEntries = entries.map(entry => {
    const categoryAttrs = categories[entry.category]
    if (!categoryAttrs) {
      return null;
    }
    const enhanced = { ...entry, categoryAttrs, isVisible: true }
    return { ...enhanced, isLarge: isLargeFn(enhanced) }
  }).filter ( (x) => !!x);

  return ReactDOMServer.renderToStaticMarkup (
    <>
      <div className="side-content">
        <span className="landscape-logo">
          <a className="nav-link" href="/">
            <img src="images/left-logo.svg" />
          </a>
        </span>
        <div className="guide-sidebar">
          <div className="sidebar-collapse">+</div>
          <div className="guide-toggle">
            <span className="toggle-item "><a href="./">Landscape</a></span>
            <span className="toggle-item active">Guide</span>
          </div>
          <Navigation nodes={guide} />
        </div>
      </div>

      <div className="guide-header">
        <div className="container">
          <div className="content">
            <button className="sidebar-show">
              <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>
            </button>
            <span className="landscape-logo">
              <a className="nav-link" href="/">
                <img src="/images/left-logo.svg" />
              </a>
            </span>
            <Title />
          </div>
        </div>
        <a rel="noopener noreferrer noopener noreferrer"
          className="landscapeapp-logo"
          title={settings.global.short_name}
          target="_blank"
          href={settings.global.company_url}>
          <img src="images/right-logo.svg" title={settings.global.short_name}/>
        </a>
      </div>

      <div className="main-content">
        <div className="container">
          <div className="content">
            <Title />
            <Content nodes={guide} enhancedEntries={enhancedEntries} />
          </div>
        </div>
      </div>
    </>
  );
}

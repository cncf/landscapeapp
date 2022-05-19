import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { isLargeFn } from '../utils/landscapeCalculations'
import Item from './Item.js'
import _ from 'lodash';
import { guideIcon } from '../icons';
import assetPath from '../utils/assetPath';



// guide is a guide index
export function render({settings, items, guide }) {
  const Title = () => <h1 className="title">{settings.global.short_name} Landscape Guide</h1>;
  const SubcategoryMetadata = ({ node, entries }) => {
    const orderedEntries = _.orderBy(entries,  (x) => !x.isLarge);
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
        { orderedEntries.map(entry => <Item item={entry} key={entry.id} />) }
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
    const href = `card-mode?category=${landscapeKey}`
    return <a href={href} target="_blank" className="permalink">
      {guideIcon} {title}
    </a>
  }

  const Content = ({ nodes, enhancedEntries }) => {
    return nodes.map((node, idx) => {
      const subcategoryEntries = node.subcategory && enhancedEntries.filter(entry => entry.path.split(' / ')[1].trim() === node.title) || []

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

  const enhancedEntries = items.map( (entry) => {
    let subcategory = entry.path.split(' / ')[1];
    let categoryAttrs = null;
    for (let key in settings.big_picture) {
      let page = settings.big_picture[key];
      for (let element of page.elements) {
        if (!page.category && element.category === entry.category) {
          categoryAttrs = element;
        }
        if (page.category === entry.category && element.category === subcategory) {
          categoryAttrs = element;
        }
      }
    }

    if (!categoryAttrs) {
      return null;
    }
    const enhanced = { ...entry, categoryAttrs }
    return { ...enhanced, isLarge: isLargeFn(enhanced) }
  }).filter( (x) => !!x);

  return ReactDOMServer.renderToStaticMarkup (
    <>
      <div className="side-content">
        <span className="landscape-logo">
          <a className="nav-link" href="/">
            <img src={assetPath("images/left-logo.svg")} />
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
                <img src={assetPath("/images/left-logo.svg")} />
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
          <img src={assetPath("images/right-logo.svg")} title={settings.global.short_name}/>
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

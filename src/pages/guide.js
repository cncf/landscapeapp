import React, { useState } from 'react'
import { existsSync, readFileSync } from 'fs'
import traverse from 'traverse'
import Typography from '@material-ui/core/Typography'
import classNames from 'classnames'
import { LandscapeProvider } from '../contexts/LandscapeContext'
import MenuIcon from '@material-ui/icons/Menu'
import IconButton from '@material-ui/core/IconButton'
import RoomIcon from '@material-ui/icons/Room'
import CloseIcon from '@material-ui/icons/Close'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import assetPath from '../utils/assetPath'

const GuidePage = props => {
  const nodes = traverse(props).reduce(function(acc, node) {
    if (node.title || node.content) {
      acc.push({ ...node, key: this.path.join('-') })
    }
    return acc
  }, [])

  const [sidebarVisible, setSidebarVisible] = useState(false)
  const showSidebar = _ => setSidebarVisible(true)
  const hideSidebar = _ => setSidebarVisible(false)

  const { asPath } = useRouter()
  const currentSection = asPath.split('#')[1]

  return <LandscapeProvider entries={[]} pageParams={{ mainContentMode: 'landscape' }}>
    <div id="guide-page" className={classNames('app',{'filters-opened' : sidebarVisible, 'big-picture': true })}>
      <div className="main-parent" >
        <style jsx global>{`
          #guide-page h2,
          #guide-page h3,
          #guide-page h4,
          #guide-page h5 {
            line-height: 1.2;
            font-weight: bold;
            margin: 0 0 1rem;
          }

          #guide-page p,
          #guide-page table,
          #guide-page blockquote {
            margin: 0 0 1rem;
          }

          #guide-page h2 {
            font-size: 2rem;
            margin: 0 0 1rem;
          }

          #guide-page h3 {
            font-size: 1.5rem;
          }

          #guide-page h4 {
            font-size: 1.25rem;
          }

          #guide-page h5 {
            font-size: 1.125rem;
          }

          #guide-page .sidebar-scroll {
            margin-top: 20px;
          }

          #guide-content {
            max-width: 1050px;
          }

          #guide-content blockquote {
            background: #ebebeb;
            padding: 1.5rem 1.5rem 0.5rem;
          }

          #guide-page table,
          #guide-page table th,
          #guide-page table td {
            border: 1px solid #d0d0d0;
            border-collapse: collapse;
            padding: 0.5rem 1rem 0.3rem;
          }

          #guide-page table th {
            background: #ebebeb;
          }

          #guide-content img {
            max-width: 100%;
            display: block;
            margin: 0 auto;
          }

          #guide-content .permalink svg {
            vertical-align: text-top;
            margin-left: 5px;
          }

          #guide-content .permalink:hover {
            text-decoration: underline;
          }
        `}</style>
        <Header />
        <IconButton className="sidebar-show" title="Show sidebar" onClick={showSidebar}><MenuIcon /></IconButton>
        <div className="sidebar">
          <div className="sidebar-scroll">
            <IconButton className="sidebar-collapse" title="Hide sidebar" onClick={hideSidebar}><CloseIcon /></IconButton>
            {
              nodes.filter(node => node.title)
                .map(node => <div key={node.key} style={{ marginLeft: node.level * 8, marginBottom: 6 }}>
                  <Link href={`#${node.identifier}`} prefetch={false}>
                    <a className={`nav-link`} style={{ color: node.identifier === currentSection ? 'black' : null }}>{node.title}</a>
                  </Link>
                </div>
              )
            }
          </div>
        </div>
        <div id="guide-content" className="main">
          {
            nodes.map(node => {
              return <div key={node.key} id={node.title && node.identifier} >
                { node.title && <Typography variant={`h${node.level + 1}`}>
                  { node.permalink && <a href={assetPath(`/card-mode?category=${node.permalink}`)} target="_blank" className="permalink">
                    {node.title}<RoomIcon />
                  </a> }
                  { !node.permalink && node.title }
                </Typography> }
                { node.isText && <div dangerouslySetInnerHTML={{ __html: node.content }} /> }
              </div>
            })
          }
        </div>
      </div>
    </div>
  </LandscapeProvider>
}

export async function getStaticProps() {
  const notFound = !existsSync('public/guide.json')
  const props = notFound ? {} : JSON.parse(readFileSync('public/guide.json', 'utf-8'))
  return { props, notFound }
}

export default GuidePage

import React, { useContext } from 'react'
import Link from 'next/link'
import LandscapeContext from '../contexts/LandscapeContext'

const ToggleItem = ({ isActive, title, to }) => {
  return <span className={`toggle-item ${isActive ? 'active' : ''}`}>
    <style jsx>{`
      .toggle-item {
        width: 50%;
        text-align: center;
        padding: 2px;
        color: #2E67BF;
        background: white;
        display: inline-block;
      }

      .toggle-item.active {
        background: #2E67BF;
        color: white;
      }

      a {
        transition: none;
      }

      a:hover {
        color: #2E67BF;
      }
    `}</style>
    {isActive ? title : <Link href={to} prefetch={false}>
      <a>{title}</a>
    </Link>}
  </span>
}

const GuideToggle = ({ active }) => {
  const { guideIndex } = useContext(LandscapeContext)

  if (active === 'landscape' && !guideIndex) {
    return null
  }

  return <div className="guide-toggle">
    <style jsx>{`
      .guide-toggle {
        border: 2px solid #2E67BF;
        background: #2E67BF;
        border-radius: 4px;
        max-width: 400px;
        margin: 0;
        font-size: 14px;
        margin: 15px 0;
        max-width: 165px;
      }
    `}</style>
    <ToggleItem isActive={active === 'landscape'} title="Landscape" to="/" />
    <ToggleItem isActive={active === 'guide'} title="Guide" to="/guide" />
  </div>
}

export default GuideToggle

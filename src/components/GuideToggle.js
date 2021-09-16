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
    `}</style>
    {isActive ? title : <Link href={to} prefetch={false}>
      <a >{title}</a>
    </Link>}
  </span>
}

const GuideToggle = ({ active }) => {
  const { guideMap } = useContext(LandscapeContext)

  if (active === 'landscape' && Object.keys(guideMap).length === 0) {
    return null
  }

  return <div className="guide-toggle">
    <style jsx>{`
      .guide-toggle {
        border: 2px solid #2E67BF;
        border-radius: 4px;
        max-width: 400px;
      }

    `}</style>
    <ToggleItem isActive={active === 'landscape'} title="Landscape" to="/" />
    <ToggleItem isActive={active === 'guide'} title="Guide" to="/guide" />
  </div>
}

export default GuideToggle

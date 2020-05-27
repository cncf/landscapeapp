import traverse from 'traverse';
import {settings, saveSettings} from './settings';
import { landscape, saveLandscape } from "./landscape";

const incrementValues = (ref, values, stop = true) => {
  let {...attrs} = ref.node
  for (const key in values) {
    attrs[key] += values[key]
  }
  ref.update({...attrs}, stop)
}

let newSettings = traverse(settings).map(function () {
  if (settings.big_picture.main.size && this.node) {
    if (this.node.size) {
      const {size, ...attrs} = this.node
      this.update({...attrs})
    }

    if (this.node.type === 'LandscapeInfo') {
      incrementValues(this, {left: -5}, false)
    }

    if (this.node.type === 'LandscapeLink' && this.node.layout === 'subcategory') {
      incrementValues(this, {left: -5}, false)
    }

    if (settings.global.short_name === 'CNCF') {
      if (this.node.category === 'App Definition and Development') {
        incrementValues(this, {height: -3})
      }

      if (this.node.category === 'Orchestration & Management') {
        incrementValues(this, {height: -3, top: -3})
      }

      if (this.node.category === 'Runtime') {
        incrementValues(this, {top: -6})
      }

      if (this.node.category === 'Provisioning') {
        incrementValues(this, {top: -6, height: -4})
      }

      if (this.node.category === 'Special') {
        incrementValues(this, {top: -10, height: 10})
      }

      if (this.node.category === 'Platform') {
        incrementValues(this, {height: -10, left: 2})
      }

      if (this.node.type === 'LandscapeInfo' && this.parent.parent.node.url === 'landscape') {
        incrementValues(this, {top: -10, height: 10})
      }

      if (this.node.type === 'LandscapeLink' && this.node.title === 'Members') {
        incrementValues(this, {top: -10, height: 10})
      }

      if (this.node.type === 'LandscapeLink' && this.node.title === 'Serverless') {
        incrementValues(this, {top: -20, height: 10})
      }

      if (this.node.category === 'Observability and Analysis') {
        incrementValues(this, {height: -20})
      }

      if (this.node.category === 'Tools') {
        this.update({...this.node, fit_width: true}, true)
      }

      if (this.node.category === 'Hosted Platform') {
        incrementValues(this, {width: 80})
      }

      if (this.node.category === 'Installable Platform') {
        incrementValues(this, {width: -70, left: 70})
      }
    }

    if (settings.global.short_name === 'LFAI') {
      if (this.node.category === 'Machine Learning') {
        incrementValues(this, {width: 10})
      }

      if (this.node.category === 'Deep Learning') {
        incrementValues(this, {left: 10})
      }

      if (this.node.category === 'Reinforcement Learning') {
        incrementValues(this, {left: 10})
      }

      if (this.node.category === 'Programming') {
        incrementValues(this, {left: 10, width: -5 })
      }

      if (this.node.category === 'Security & Privacy') {
        incrementValues(this, {left: 5, width: -5 })
      }
    }

    if (settings.global.short_name === 'ASWF') {
      if (this.node.category === 'ASWF Member Company') {
        incrementValues(this, {height: 34, top: -34 })
      }

      if (this.node.type === 'LandscapeInfo') {
        incrementValues(this, {height: -34 }, false)
      }

      if (this.parent && this.parent.parent && this.parent.parent.node.type === 'LandscapeInfo') {
        if (this.node.type === 'text') {
          incrementValues(this, {top: -10, left: -15})
        }

        if (this.node.title === 'QR Code') {
          incrementValues(this, {top: -16, left: -4, width: -2})
        }

        if (this.node.title === 'l.aswf.io') {
          incrementValues(this, {top: -20, left: -6})
        }

        if (this.node.title === 'Landscape Logo') {
          incrementValues(this, {top: -10})
        }

        if (this.node.title === 'ASWF Logo') {
          incrementValues(this, {top: -15})
        }
      }
    }
  }

  if (settings.big_picture.main.fullscreen_size && this.node) {
    if (this.node.fullscreen_size) {
      const { fullscreen_size, ...attrs } = this.node
      this.update({ ...attrs })
    }

    if (this.node.type === 'LandscapeLink' && this.node.layout === 'subcategory') {
      incrementValues(this, { left: 60, width: -120, height: -20 }, false)
    }
  }
})

saveSettings(newSettings)

let newLandscape = traverse(landscape).forEach(function(node) {
  if (settings.global.short_name === 'LFPH') {
    if (node && node.repo_url === 'https://github.com/covid19risk/covidwatch-android' && !node.additional_repos) {
      this.update({ ...this.node, additional_repos: [{ repo_url: 'https://github.com/covid19risk/covidwatch-ios' }] })
    }
  }
})

saveLandscape(newLandscape)


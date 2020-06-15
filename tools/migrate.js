import { settings, saveSettings } from './settings'

const { test, ...rest } = settings
saveSettings(rest)

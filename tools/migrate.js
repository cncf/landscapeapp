import traverse from 'traverse';
import {settings, saveSettings} from './settings';

let newSettings = traverse(settings).map(function () {
})

saveSettings(newSettings)

import path from 'path';
import fs from 'fs';

const projectPath = process.env.PROJECT_PATH;
const allItems = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'dist/data/items-export.json'), 'utf-8'));
const items = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'dist/data/items.json'), 'utf-8'));
const settings = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'dist/settings.json')));

import { flattenItems } from '../utils/itemsCalculator';
import getGroupedItems  from '../utils/itemsCalculator';
import getSummary, { getSummaryText } from '../utils/summaryCalculator';
import { parseParams } from '../utils/routing';
import Parser from 'json2csv/lib/JSON2CSVParser';

export const processRequest = query => {
  const params = parseParams(query);
  const p = new URLSearchParams(query);
  params.format = p.get('format');

  const selectedItems = flattenItems(getGroupedItems({data: items, ...params}))
    .reduce((acc, item) => ({ ...acc, [item.id]: true }), {})

  const fields = allItems[0].map(([label, _]) => label !== 'id' && label).filter(_ => _);
  const itemsForExport = allItems
    .map(item => item.reduce((acc, [label, value]) =>  ({ ...acc, [label]: value }), {}))
    .filter(item => selectedItems[item.id]);

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(itemsForExport, { fields });
  return csv;
}

// Netlify function
export async function handler(event, context) {
  const body = processRequest(event.queryStringParameters)
  const headers = {
      'Content-Type': 'text/css',
      'Content-Disposition': 'attachment; filename=interactive-landscape.csv'
  };
  return { statusCode: 200, body: body, headers }
}

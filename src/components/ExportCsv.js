import SystemUpdateIcon from '@material-ui/icons/SystemUpdate'
import assetPath from '../utils/assetPath'
import { useContext, useEffect, useState } from 'react'
import LandscapeContext from '../contexts/LandscapeContext'
import Parser from 'json2csv/lib/JSON2CSVParser'
import { flattenItems } from '../utils/itemsCalculator'

const _downloadCSV = (allItems, selectedItems) => {
  const fields = allItems[0].map(([label, _]) => label !== 'id' && label).filter(_ => _)
  const itemsForExport = allItems
    .map(item => item.reduce((acc, [label, value]) =>  ({ ...acc, [label]: value }), {}))
    .filter(item => selectedItems[item.id])

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(itemsForExport, { fields });
  const filename = 'interactive_landscape.csv'
  const data = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)

  const link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', filename);
  link.click();
}

const ExportCsv = _ => {
  const { groupedItems } = useContext(LandscapeContext)
  const [shouldFetch, setShouldFetch] = useState(false)

  const [itemsForExport, setItemsForExport] = useState(null);

  const fetched = !!itemsForExport

  useEffect(async () => {
    if (!itemsForExport && shouldFetch) {
      const result = await fetch('data/items-export.json');
      const json = await result.json();
      setItemsForExport(json);
    }
  });

  useEffect(() => {
    if (fetched) {
      downloadCSV()
    }
  }, [fetched])


  const selectedItems = flattenItems(groupedItems)
    .reduce((acc, item) => ({ ...acc, [item.id]: true }), {})
  const downloadCSV = () => _downloadCSV(itemsForExport, selectedItems)

  const onClick = _ => {
    if (!fetched) {
      setShouldFetch(true)
    } else {
      downloadCSV()
    }
  }


  return <a className="filters-action" onClick={onClick} aria-label="Download as CSV">
    <SystemUpdateIcon/><span>Download as CSV</span>
  </a>
};
export default ExportCsv

import React from 'react';
import { pure } from 'recompose';
import SystemUpdateIcon from '@material-ui/icons/SystemUpdate';

const ExportCsv = ({onExport}) => {
  // TODO: fix exporting CSV
  return (
    <div className="filters-action" onClick={()=>onExport()} aria-label="Download as CSV">
      <SystemUpdateIcon /><span>Download as CSV</span>
    </div>
  );
};
export default pure(ExportCsv);

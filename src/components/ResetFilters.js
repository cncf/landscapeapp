import React, { useContext } from 'react';
import { pure } from 'recompose';
import ResetIcon from '@material-ui/icons/SettingsBackupRestore';
import LandscapeContext from '../contexts/LandscapeContext'
import paramsToRoute from '../utils/paramsToRoute'
import { useRouter } from 'next/router'

const ResetFilters = _ => {
  const { params } = useContext(LandscapeContext)
  const router = useRouter()

  // TODO: clean up with validate
  const reset = _ => {
    const url = paramsToRoute({ ...params, filters: null })
    router.push(url)
  }

  return (
    <div className="filters-action" onClick={()=>reset()} aria-label="Reset Filters">
      <ResetIcon /><span>Reset Filters</span>
    </div>
  );
};
export default pure(ResetFilters);

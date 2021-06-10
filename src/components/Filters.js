import React from 'react';
import { pure } from 'recompose';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

import ProjectFilterContainer from './ProjectFilterContainer';
import IsvStatusFilterContainer from './IsvStatusFilterContainer';
import FrameworksFilterContainer from './FrameworksFilterContainer';
import UseCasesFilterContainer from './UseCasesFilterContainer';
import LicenseFilterContainer from './LicenseFilterContainer';
import OrganizationFilterContainer from './OrganizationFilterContainer';
import HeadquartersFilterContainer from './HeadquartersFilterContainer';
import ArrayFilterContainer from './ArrayFilterContainer';
import fields from '../types/fields';
import CategoryFilter from './CategoryFilter'
const Filters = () => {
  return <div>
      <FormGroup row>
        <FormControl component="fieldset">
          <FormLabel component="legend">{fields.landscape.label}</FormLabel>
          <CategoryFilter/>
        </FormControl>
      </FormGroup>

      <FormGroup row>
        <FormControl component="fieldset">
          <FormLabel component="legend">{fields.status.label}</FormLabel>
          <IsvStatusFilterContainer/>
        </FormControl>
      </FormGroup>

      <FormGroup row>
        <FormControl component="fieldset">
          <FormLabel component="legend">{fields.license.label}</FormLabel>
          <LicenseFilterContainer />
        </FormControl>
      </FormGroup>

      <FormGroup row>
        <FormControl component="fieldset">
          <FormLabel component="legend">{fields.frameworks_filter.label}</FormLabel>
          <FrameworksFilterContainer/>
        </FormControl>
      </FormGroup>

      <FormGroup row>
        <FormControl component="fieldset">
          <FormLabel component="legend">{fields.use_cases_filter.label}</FormLabel>
          <UseCasesFilterContainer/>
        </FormControl>
      </FormGroup>

      <FormGroup row>
        <FormControl component="fieldset">
          <FormLabel component="legend">{fields.organization.label}</FormLabel>
          <OrganizationFilterContainer />
        </FormControl>
      </FormGroup>

  </div>;
}
export default pure(Filters);

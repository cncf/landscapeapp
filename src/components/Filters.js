import React from 'react';
import { pure } from 'recompose';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

import ProjectFilterContainer from './ProjectFilterContainer';
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
          <FormLabel component="legend">{fields.relation.label}</FormLabel>
          <ProjectFilterContainer/>
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
          <FormLabel component="legend">{fields.organization.label}</FormLabel>
          <OrganizationFilterContainer />
        </FormControl>
      </FormGroup>

      <FormGroup row>
        <FormControl component="fieldset">
          <FormLabel component="legend">{fields.headquarters.label}</FormLabel>
          <HeadquartersFilterContainer />
        </FormControl>
      </FormGroup>

      <FormGroup row>
        <FormControl component="fieldset">
          <FormLabel component="legend">{fields.companyType.label}</FormLabel>
          <ArrayFilterContainer name="companyType" />
        </FormControl>
      </FormGroup>

    <FormGroup row>
      <FormControl component="fieldset">
        <FormLabel component="legend">{fields.industries.label}</FormLabel>
        <ArrayFilterContainer name="industries" />
      </FormControl>
    </FormGroup>
  </div>;
}
export default pure(Filters);

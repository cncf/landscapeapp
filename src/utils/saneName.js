import _ from 'lodash';
import { paramCase } from 'change-case';
export default function(x) {
  return _.deburr(paramCase(x));
};

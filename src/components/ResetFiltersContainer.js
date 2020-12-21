import ResetFilters from './ResetFilters';
import { resetFilters } from '../reducers/mainReducer.js';


const mapStateToProps = () => ({
});
const mapDispatchToProps = {
  reset: resetFilters
};

export default ResetFilters

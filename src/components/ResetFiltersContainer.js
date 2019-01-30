import { connect } from 'react-redux';
import ResetFilters from './ResetFilters';
import { resetFilters } from '../reducers/mainReducer.js';


const mapStateToProps = () => ({
});
const mapDispatchToProps = {
  reset: resetFilters
};

export default connect(mapStateToProps, mapDispatchToProps)(ResetFilters);

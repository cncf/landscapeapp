import { connect } from 'react-redux';
import Header from './Header';
import { resetParameters } from '../reducers/mainReducer.js';


const mapStateToProps = () => ({
  test: 1
});
const mapDispatchToProps = {
  reset: resetParameters
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);

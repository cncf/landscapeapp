import Summary from './Summary';
import getSummary from '../utils/summaryCalculator';

const mapStateToProps = (state) => ({
  summary: getSummary(state),
  ready: state.main.ready
});
const mapDispatchToProps = {

};

// TODO: put back
export default () => <div></div>

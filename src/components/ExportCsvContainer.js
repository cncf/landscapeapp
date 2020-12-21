import ExportCsv from './ExportCsv';
import { exportCsv } from '../reducers/mainReducer.js';


const mapStateToProps = () => ({
});
const mapDispatchToProps = {
  onExport: exportCsv
};

export default ExportCsv

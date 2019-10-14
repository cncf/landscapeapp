require("@babel/register");
const { setFatalError, reportFatalErrors } = require('./fatalErrors');

class MyCustomReporter {
  onRunComplete(contexts, results) {
    if (results.numFailedTestSuites > 0) {
      setTimeout(async function() {
        setFatalError('Integration tests have failed for unclear reasons. Please run locally for more info and/or ask for help on #landscapers-help on slack.cncf.io');
        await reportFatalErrors();
      }, 1);
    }
  }
}

module.exports = MyCustomReporter;

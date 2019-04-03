let _hasFatalErrors = false;
export hasFatalErrors() {
  return _hasFatalErrors;
}
export setFatalError() {
  _hasFatalErrors = true;
}

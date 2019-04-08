let _hasFatalErrors = false;
export function hasFatalErrors() {
  return _hasFatalErrors;
}
export function setFatalError() {
  _hasFatalErrors = true;
}

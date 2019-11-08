import React from "react";
import ReactDOM from "react-dom";
import { withRouter } from "react-router";
import queryString from 'query-string';
import { landscapeSettingsList } from "../utils/landscapeSettings";

const additionalLandscapes = landscapeSettingsList.slice(1).map(({ url }) => url);
const allowedFormats = ["card-mode", ...additionalLandscapes];

const isCanonical = (pathname) => {
  const params = queryString.parse(pathname.split("/").pop());
  const paramsCount = Object.keys(params).length;

  return paramsCount === 0 ||
    (paramsCount === 1 && allowedFormats.includes(params.format)) ||
    (paramsCount === 1 && "selected" in params) ||
    (paramsCount === 2 && "selected" in params && allowedFormats.includes(params.format));
}

const Head = ({ location }) => {
  const indexTag = isCanonical(location.pathname) ?
    <link rel="canonical" href={window.location.href}/> :
    <meta name="robots" content="noindex"/>;

  return ReactDOM.createPortal(indexTag, document.head);
};

export default withRouter(Head);

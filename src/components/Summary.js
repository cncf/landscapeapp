import React from 'react';
import { pure } from 'recompose';
import millify from 'millify';
import formatNumber from '../utils/formatNumber';
import _ from 'lodash';

const getText = ({summary}) => {
  if (!summary.total) {
    return 'There are no cards matching your filters';
  }
  const cardsText = summary.total === 1 ? 'card' : 'cards';
  const startText = `You are viewing ${formatNumber(summary.total)} ${cardsText} with a total`;
  const starsSection = summary.stars ? `of ${formatNumber(summary.stars)} stars` : null;
  const marketCapSection = summary.marketCap ? `market cap of $${millify(summary.marketCap)}` : null;
  const fundingSection = summary.funding ? `funding of $${millify(summary.funding)}` : null;
  if (!marketCapSection && !fundingSection && !starsSection) {
    return `You are viewing ${formatNumber(summary.total)} ${cardsText}.`;
  }

  const parts = [starsSection, marketCapSection, fundingSection].filter( (x) => !!x);
  const startPartsText = _.slice(parts, 0, -1).join(', ');
  const lastPart = _.slice(parts, -1)[0];
  const text = [startPartsText, lastPart].filter( (x) => !!x).join(' and ');
  return `${startText} ${text}.`;
}

const Summary = ({ready, summary}) => {
  if (ready === 'partially') {
    return <h4 className="summary">Loading remaining entries... </h4>;
  }
  return <h4 className="summary">{getText({summary})}</h4>;
}
export default pure(Summary);

import { h } from '../utils/format';
export function renderGuideLink({anchor, label, style }) {
  const svg = `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
  </svg>`;
  const ariaLabel = `Read more about ${label} on the guide`
  const to = `guide#${anchor}`;

  return `<a data-type="external" target="_blank" style="${style}" aria-label="${h(ariaLabel)}">
    ${svg}
  </a>`;
}

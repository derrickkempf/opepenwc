import React from 'react';

// Inline OWC trophy logo SVG (from owc-trophy.svg, <?xml?> stripped, classes scoped).
export function LogoSvg() {
  return (
    <svg className="hdr-trophy" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60.98 121.89" aria-label="Opepen World Cup">
      <defs><style>{`.owctrophy .cls-1{fill:none}.owctrophy .cls-2{fill:#8e6019}.owctrophy .cls-3{fill:#2b5b48}.owctrophy .cls-4{fill:#b18336}.owctrophy .cls-5{fill:#e3ca86}.owctrophy .cls-6{fill:#a7792b}.owctrophy .cls-7{fill:#014127}.owctrophy .cls-8{fill:#9b6c2c}.owctrophy .cls-9{fill:#472808}`}</style></defs>
      <g className="owctrophy">
        <polygon className="cls-1" points="52.02 52.02 30.51 73.53 52.02 52.02 52.02 52.02" />
        <path className="cls-1" d="M8.92,52.02c-1.32-1.32-2.48-2.72-3.51-4.2,1.03,1.48,2.19,2.88,3.51,4.2l21.55,21.55.04-.04-.04.04-21.55-21.55Z" />
        <polygon className="cls-1" points="30.51 30.51 30.51 30.51 30.51 30.51 30.51 30.51" />
        <path className="cls-1" d="M3.61,44.86c-.12-.21-.23-.43-.34-.65.11.22.22.43.34.65Z" />
        <path className="cls-1" d="M5.04,47.26c-.12-.18-.23-.36-.35-.54.11.18.23.36.35.54Z" />
        <path className="cls-4" d="M52.02,52.02l-21.51,21.51v17.89h30.47V30.51h-.04c0,7.79-2.98,15.57-8.92,21.51l.04.04-.04-.04h0Z" />
        <rect className="cls-7" x="30.51" y="91.42" width="30.47" height="30.47" />
        <path className="cls-8" d="M30.51,73.57v-.04l-.04.04-21.55-21.55c-1.32-1.32-2.48-2.72-3.51-4.2-.13-.18-.25-.37-.38-.56-.12-.18-.23-.36-.35-.54-.39-.61-.75-1.23-1.08-1.86-.12-.21-.23-.43-.34-.65-.89-1.77-1.61-3.61-2.13-5.49-.62-2.21-.99-4.48-1.1-6.76v59.44h30.47v-17.85Z" />
        <rect className="cls-3" x=".04" y="91.42" width="30.47" height="30.47" />
        <path className="cls-5" d="M52.06,8.96s-.02-.03-.04-.04h0c-11.9-11.9-31.19-11.9-43.09,0l21.58,21.58,21.55-21.55Z" />
        <polygon className="cls-6" points="30.51 30.51 30.43 30.51 8.92 52.02 30.47 73.57 30.51 73.53 52.02 52.02 52.02 52.02 52.02 52.02 30.51 30.51 30.51 30.51" />
        <path className="cls-2" d="M1.13,38.73c.53,1.88,1.24,3.72,2.13,5.49.11.22.22.43.34.65.34.63.7,1.25,1.08,1.86.11.18.23.36.35.54.12.19.25.37.38.56,1.03,1.48,2.19,2.88,3.51,4.2l21.51-21.51h.07S8.92,8.93,8.92,8.93h0C2.59,15.26-.37,23.68.04,31.97H.04c.11,2.28.48,4.55,1.1,6.76Z" />
        <path className="cls-2" d="M5.41,47.82c-.13-.18-.25-.37-.38-.56.12.19.25.37.38.56Z" />
        <path className="cls-2" d="M4.69,46.72c-.39-.61-.75-1.23-1.08-1.86.34.63.7,1.25,1.08,1.86Z" />
        <path className="cls-2" d="M3.27,44.22c-.89-1.77-1.61-3.61-2.13-5.49.53,1.88,1.24,3.72,2.13,5.49Z" />
        <path className="cls-2" d="M.04,31.97H.04c.11,2.28.48,4.55,1.1,6.76-.62-2.21-.99-4.48-1.1-6.76Z" />
        <path className="cls-9" d="M30.51,30.51l21.51,21.51c5.94-5.94,8.92-13.72,8.92-21.51,0-7.79-2.95-15.59-8.89-21.55l-21.55,21.55h0Z" />
      </g>
    </svg>
  );
}

export function XLogo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block' }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function PitchSvg() {
  return (
    <svg className="pitch-svg" viewBox="0 0 1216 541" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="var(--pitch)" strokeWidth="1.5" strokeMiterlimit="10">
        <rect x="68" y=".5" width="540" height="540" />
        <rect x="608" y=".5" width="540" height="540" />
        <circle cx="608" cy="270.5" r="135" />
        <rect x="68" y="135.5" width="135" height="270" />
        <rect x=".5" y="203" width="67.5" height="135" />
        <rect x="1148" y="203" width="67.5" height="135" />
        <rect x="1013" y="135.5" width="135" height="270" />
        <path d="M203,203h0v135h0c37.28,0,67.5-30.22,67.5-67.5h0c0-37.28-30.22-67.5-67.5-67.5Z" />
        <path d="M1013,338h0v-135h0c-37.28,0-67.5,30.22-67.5,67.5h0c0,37.28,30.22,67.5,67.5,67.5Z" />
      </g>
    </svg>
  );
}

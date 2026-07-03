import * as React from "react";

const SvgComponent = (props) => (
  <svg
    width="40px"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >

    <path d="M5.242 13.769 0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" 
    fill="#12223A" />
  </svg>
);

export { SvgComponent as IconGooglescholar };

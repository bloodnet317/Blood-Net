import React from 'react';

const UnrealLogo: React.FC<{ className?: string, size?: number }> = ({ className, size = 100 }) => {
  return (
    <svg 
      viewBox="280 90 240 290" 
      width={size} 
      height={size} 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Face */}
      <polygon 
        points="286.03,159.87 399.79,90.12 512.75,159.87 399.39,234.32" 
        className="fill-bg-text/90"
      />
      {/* Inner Top Hole */}
      <polygon 
        points="346.07,159.47 399.39,127.34 454.29,159.47 400.18,193.17" 
        className="fill-bg-dark"
      />
      
      {/* Middle Sections */}
      <polygon 
        points="282.61,164.44 316.84,183.77 316.84,213.55 400.18,268.93 400.18,308.12 282.61,233.92" 
        fill="#29ABE2"
      />
      <polygon 
        points="517.76,164.44 483.52,183.77 483.52,213.55 400.18,268.93 400.18,308.12 517.76,233.92" 
        fill="#0071BC"
      />
      
      {/* Bottom Sections */}
      <polygon 
        points="282.61,239.67 315.79,258.48 315.79,285.13 400.18,339.99 400.18,379.17 282.61,309.42" 
        fill="#29ABE2"
      />
      <polygon 
        points="517.76,239.67 483.26,260.57 483.26,288.26 400.18,339.99 400.18,379.17 517.76,309.42" 
        fill="#0071BC"
      />
    </svg>
  );
};

export default UnrealLogo;

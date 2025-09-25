import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

const CustomArrow: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M8 6L16 12L8 18" 
          fill="currentColor"
        />
      </svg>
    </SvgIcon>
  );
};

export default CustomArrow;

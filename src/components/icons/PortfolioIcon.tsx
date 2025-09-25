import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

const PortfolioIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 背景圆形 */}
        <circle cx="12" cy="12" r="10" fill="#E3F2FD" stroke="#1976D2" strokeWidth="1.5"/>
        
        {/* 上升趋势线 */}
        <path d="M6 16 L9 12 L12 14 L15 8 L18 10" 
              stroke="#2E7D32" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none"/>
        
        {/* 趋势线上的点 */}
        <circle cx="9" cy="12" r="1.5" fill="#2E7D32"/>
        <circle cx="12" cy="14" r="1.5" fill="#2E7D32"/>
        <circle cx="15" cy="8" r="1.5" fill="#2E7D32"/>
        <circle cx="18" cy="10" r="1.5" fill="#2E7D32"/>
        
        {/* 投资组合元素 - 不同大小的矩形代表不同投资 */}
        <rect x="7" y="6" width="3" height="2" rx="0.5" fill="#1976D2" opacity="0.8"/>
        <rect x="11" y="5" width="2" height="3" rx="0.5" fill="#FF9800" opacity="0.8"/>
        <rect x="14" y="7" width="2.5" height="1.5" rx="0.5" fill="#4CAF50" opacity="0.8"/>
        
        {/* 货币符号 */}
        <text x="12" y="20" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#1976D2">$</text>
      </svg>
    </SvgIcon>
  );
};

export default PortfolioIcon;

import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        height: 80,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        flexShrink: 0 // 防止被压缩
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontSize: '0.75rem',
          textAlign: 'center'
        }}
      >
        保留所有版权。@深圳市鹭森信息智能研究院
      </Typography>
    </Box>
  );
};

export default Footer;

import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { brandingConfig } from './branding';

/**
 * 品牌配置示例组件
 * 展示如何动态更改品牌配置
 */
const BrandingConfigExample: React.FC = () => {
  const [config, setConfig] = useState(brandingConfig.getConfig());
  const [logoSrc, setLogoSrc] = useState(config.logo.src);
  const [logoAlt, setLogoAlt] = useState(config.logo.alt);
  const [logoWidth, setLogoWidth] = useState(config.logo.width || 48);
  const [logoHeight, setLogoHeight] = useState(config.logo.height || 48);
  const [title, setTitle] = useState(config.title);
  const [subtitle, setSubtitle] = useState(config.subtitle);
  const [sloganText, setSloganText] = useState(config.slogan.text);
  const [sloganFontSize, setSloganFontSize] = useState(config.slogan.style?.fontSize || '0.75rem');
  const [sloganFontWeight, setSloganFontWeight] = useState(config.slogan.style?.fontWeight || 400);
  const [sloganColor, setSloganColor] = useState(config.slogan.style?.color || 'rgba(255, 255, 255, 0.8)');
  const [sloganOpacity, setSloganOpacity] = useState(config.slogan.style?.opacity || 0.8);
  const [sloganLetterSpacing, setSloganLetterSpacing] = useState(config.slogan.style?.letterSpacing || '0.2px');

  // 监听配置变化
  useEffect(() => {
    const interval = setInterval(() => {
      setConfig(brandingConfig.getConfig());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateLogo = () => {
    brandingConfig.updateLogo({
      src: logoSrc,
      alt: logoAlt,
      width: logoWidth,
      height: logoHeight
    });
  };

  const handleUpdateText = () => {
    brandingConfig.updateText(title, subtitle);
  };

  const handleUpdateSlogan = () => {
    brandingConfig.updateSlogan(sloganText, {
      fontSize: sloganFontSize,
      fontWeight: sloganFontWeight,
      color: sloganColor,
      opacity: sloganOpacity,
      letterSpacing: sloganLetterSpacing
    });
  };

  const handleReset = () => {
    brandingConfig.updateConfig({
      logo: {
        src: '/asset/logo-1.svg',
        alt: 'Heron Sense Logo',
        width: 48,
        height: 48
      },
      title: 'Heron Trading Formula',
      subtitle: '管理系统',
      slogan: {
        text: '敏锐 洞察 热忱',
        style: {
          fontSize: '0.75rem',
          fontWeight: 400,
          color: 'rgba(255, 255, 255, 0.8)',
          opacity: 0.8,
          letterSpacing: '0.2px'
        }
      }
    });
    setLogoSrc('/asset/logo-1.svg');
    setLogoAlt('Heron Sense Logo');
    setLogoWidth(48);
    setLogoHeight(48);
    setTitle('Heron Trading Formula');
    setSubtitle('管理系统');
    setSloganText('敏锐 洞察 热忱');
    setSloganFontSize('0.75rem');
    setSloganFontWeight(400);
    setSloganColor('rgba(255, 255, 255, 0.8)');
    setSloganOpacity(0.8);
    setSloganLetterSpacing('0.2px');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        品牌配置管理
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* 当前配置显示 */}
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              当前配置
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Logo: {config.logo.src}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                尺寸: {config.logo.width} x {config.logo.height}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                标题: {config.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                副标题: {config.subtitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Slogan: {config.slogan.text}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Slogan样式: {config.slogan.style?.fontSize} / {config.slogan.style?.fontWeight}
              </Typography>
            </Box>
            
            {/* Logo预览 */}
            <Box
              sx={{
                width: config.logo.width || 48,
                height: config.logo.height || 48,
                border: '1px solid #ccc',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
              }}
            >
              <img
                src={config.logo.src}
                alt={config.logo.alt}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
          </Paper>
        </Box>

        {/* 配置编辑 */}
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              编辑配置
            </Typography>
            
            {/* Logo配置 */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Logo配置
            </Typography>
            <TextField
              fullWidth
              label="Logo路径"
              value={logoSrc}
              onChange={(e) => setLogoSrc(e.target.value)}
              size="small"
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="Alt文本"
              value={logoAlt}
              onChange={(e) => setLogoAlt(e.target.value)}
              size="small"
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="宽度"
                type="number"
                value={logoWidth}
                onChange={(e) => setLogoWidth(Number(e.target.value))}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="高度"
                type="number"
                value={logoHeight}
                onChange={(e) => setLogoHeight(Number(e.target.value))}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
            <Button variant="contained" onClick={handleUpdateLogo} sx={{ mb: 2 }}>
              更新Logo
            </Button>

            {/* 文本配置 */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              文本配置
            </Typography>
            <TextField
              fullWidth
              label="标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="small"
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="副标题"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleUpdateText} sx={{ mb: 2 }}>
              更新文本
            </Button>

            {/* Slogan配置 */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Slogan配置
            </Typography>
            <TextField
              fullWidth
              label="Slogan文本 (最多3个词语，用空格分隔)"
              value={sloganText}
              onChange={(e) => setSloganText(e.target.value)}
              size="small"
              sx={{ mb: 1 }}
              helperText="例如: 敏锐 洞察 热忱"
            />
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label="字体大小"
                value={sloganFontSize}
                onChange={(e) => setSloganFontSize(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="字重"
                type="number"
                value={sloganFontWeight}
                onChange={(e) => setSloganFontWeight(Number(e.target.value))}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label="颜色"
                value={sloganColor}
                onChange={(e) => setSloganColor(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="透明度"
                type="number"
                value={sloganOpacity}
                onChange={(e) => setSloganOpacity(Number(e.target.value))}
                size="small"
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                sx={{ flex: 1 }}
              />
            </Box>
            <TextField
              fullWidth
              label="字间距"
              value={sloganLetterSpacing}
              onChange={(e) => setSloganLetterSpacing(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleUpdateSlogan} sx={{ mb: 2 }}>
              更新Slogan
            </Button>

            {/* 重置按钮 */}
            <Button variant="outlined" onClick={handleReset} color="secondary">
              重置为默认值
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default BrandingConfigExample;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  PlayArrow,
  Pause
} from '@mui/icons-material';
import { BannerCard, BannerConfig } from '../types';

interface BannerCarouselProps {
  config: BannerConfig;
  height?: number | string;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ 
  config, 
  height = 400 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(config.autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 自动播放逻辑
  useEffect(() => {
    if (!isPlaying || !config.autoPlay || config.cards.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        // 如果到达最后一个卡片，停止轮播
        if (nextIndex >= config.cards.length) {
          setIsPlaying(false);
          return prevIndex; // 保持在最后一个卡片
        }
        return nextIndex;
      });
    }, config.autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, config.autoPlay, config.autoPlayInterval, config.cards.length]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? config.cards.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      // 如果到达最后一个卡片，停止轮播
      if (nextIndex >= config.cards.length) {
        setIsPlaying(false);
        return prevIndex; // 保持在最后一个卡片
      }
      return nextIndex;
    });
  };

  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleCardClick = (card: BannerCard) => {
    if (card.actionUrl) {
      window.location.href = card.actionUrl;
    }
  };

  if (config.cards.length === 0) {
    return null;
  }

  const currentCard = config.cards[currentIndex];

  return (
    <Box
      sx={{
        position: 'relative',
        height: height,
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: 3
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 主卡片内容 */}
      <Fade in={true} timeout={500} key={currentIndex}>
        <Paper
          elevation={0}
          sx={{
            height: '100%',
            background: currentCard.backgroundColor || 
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: currentCard.textColor || '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: currentCard.actionUrl ? 'pointer' : 'default',
            transition: 'all 0.3s ease-in-out',
            '&:hover': currentCard.actionUrl ? {
              transform: 'scale(1.02)',
              boxShadow: 6
            } : {}
          }}
          onClick={() => handleCardClick(currentCard)}
        >
          <Box
            sx={{
              textAlign: 'center',
              p: 4,
              maxWidth: isMobile ? '90%' : '60%',
              zIndex: 2
            }}
          >
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {currentCard.title}
            </Typography>
            <Typography
              variant={isMobile ? 'body1' : 'h6'}
              sx={{
                mb: 3,
                opacity: 0.9,
                lineHeight: 1.6,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              {currentCard.description}
            </Typography>
            {currentCard.actionText && currentCard.actionUrl && (
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'inherit',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                {currentCard.actionText}
              </Button>
            )}
          </Box>
        </Paper>
      </Fade>

      {/* 导航箭头 */}
      {config.showArrows && config.cards.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: 'white',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                transform: 'translateY(-50%) scale(1.1)'
              },
              zIndex: 3
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: 'white',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                transform: 'translateY(-50%) scale(1.1)'
              },
              zIndex: 3
            }}
          >
            <ChevronRight />
          </IconButton>
        </>
      )}

      {/* 播放/暂停按钮 */}
      {config.autoPlay && config.cards.length > 1 && (
        <IconButton
          onClick={togglePlayPause}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: 'white',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              transform: 'scale(1.1)'
            },
            zIndex: 3
          }}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
      )}

      {/* 指示器 */}
      {config.showIndicators && config.cards.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 3
          }}
        >
          {config.cards.map((_, index) => (
            <Box
              key={index}
              onClick={() => handleIndicatorClick(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index === currentIndex 
                  ? 'rgba(255, 255, 255, 0.9)' 
                  : 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  transform: 'scale(1.2)'
                }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BannerCarousel;

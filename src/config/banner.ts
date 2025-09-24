import { BannerConfig, BannerCard } from '../types';

// 默认Banner卡片配置
export const defaultBannerCards: BannerCard[] = [
  {
    id: 'taoism',
    title: '天之道，损有余而偿不足',
    description: '人之道则不然，损不足以奉有余 ——《道德经》',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    actionText: '了解更多',
    actionUrl: '/about'
  },
  {
    id: 'xiamen',
    title: '自强不息，止于至善',
    description: '——《厦门大学校训》',
    backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textColor: '#ffffff',
    actionText: '查看功能',
    actionUrl: '/dashboard/overview'
  },
  {
    id: 'newton',
    title: '我能够计算天体之间的引力',
    description: '却无法计算人性的贪婪——《牛顿》',
    backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    textColor: '#ffffff',
    actionText: '开始分析',
    actionUrl: '/analytics/stocks'
  }
];

// 默认Banner配置
export const defaultBannerConfig: BannerConfig = {
  cards: defaultBannerCards,
  autoPlay: true,
  autoPlayInterval: 10000, // 10秒
  showIndicators: true,
  showArrows: true
};

// Banner配置管理类
export class BannerConfigManager {
  private static instance: BannerConfigManager;
  private config: BannerConfig;

  private constructor() {
    this.config = { ...defaultBannerConfig };
  }

  public static getInstance(): BannerConfigManager {
    if (!BannerConfigManager.instance) {
      BannerConfigManager.instance = new BannerConfigManager();
    }
    return BannerConfigManager.instance;
  }

  public getConfig(): BannerConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<BannerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public addCard(card: BannerCard): void {
    this.config.cards.push(card);
  }

  public removeCard(cardId: string): void {
    this.config.cards = this.config.cards.filter(card => card.id !== cardId);
  }

  public updateCard(cardId: string, updates: Partial<BannerCard>): void {
    const cardIndex = this.config.cards.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
      this.config.cards[cardIndex] = { ...this.config.cards[cardIndex], ...updates };
    }
  }

  public setAutoPlay(enabled: boolean, interval?: number): void {
    this.config.autoPlay = enabled;
    if (interval !== undefined) {
      this.config.autoPlayInterval = interval;
    }
  }
}

// 导出便捷方法
export const bannerConfig = BannerConfigManager.getInstance();

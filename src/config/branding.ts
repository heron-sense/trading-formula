import type { AuthClient } from '../auth/session';

// 品牌配置
export interface BrandingConfig {
  logo: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  title: string;
  subtitle: string;
  slogan: {
    text: string;
    style?: {
      fontSize?: string;
      fontWeight?: number;
      color?: string;
      opacity?: number;
      letterSpacing?: string;
    };
  };
}

// 默认品牌配置
export const defaultBrandingConfig: BrandingConfig = {
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
      fontSize: '1rem',
      fontWeight: 600,
      color: 'rgba(255, 255, 255, 0.8)',
      opacity: 0.8,
      letterSpacing: '0.2px'
    }
  }
};

// 品牌配置管理
export class BrandingConfigManager {
  private static instance: BrandingConfigManager;
  private config: BrandingConfig;

  private constructor() {
    this.config = { ...defaultBrandingConfig };
  }

  public static getInstance(): BrandingConfigManager {
    if (!BrandingConfigManager.instance) {
      BrandingConfigManager.instance = new BrandingConfigManager();
    }
    return BrandingConfigManager.instance;
  }

  public getConfig(): BrandingConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<BrandingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public updateLogo(logoConfig: Partial<BrandingConfig['logo']>): void {
    this.config.logo = { ...this.config.logo, ...logoConfig };
  }

  public updateText(title?: string, subtitle?: string): void {
    if (title !== undefined) {
      this.config.title = title;
    }
    if (subtitle !== undefined) {
      this.config.subtitle = subtitle;
    }
  }

  public updateSlogan(sloganText?: string, sloganStyle?: Partial<BrandingConfig['slogan']['style']>): void {
    if (sloganText !== undefined) {
      // Prefer space-separated words; also accept Chinese commas as separators
      const words = sloganText
        .trim()
        .split(/[\s,，、]+/)
        .filter(Boolean)
        .slice(0, 3);
      this.config.slogan.text = words.join(' ') || sloganText.trim();
    }
    if (sloganStyle !== undefined) {
      this.config.slogan.style = { ...this.config.slogan.style, ...sloganStyle };
    }
  }

  public resetToDefault(): void {
    this.config = {
      ...defaultBrandingConfig,
      logo: { ...defaultBrandingConfig.logo },
      slogan: {
        ...defaultBrandingConfig.slogan,
        style: { ...defaultBrandingConfig.slogan.style },
      },
    };
  }

  /** Apply login client.group_name / client.slogan to navbar branding */
  public applyFromClient(client: AuthClient | null | undefined): void {
    if (!client) {
      this.resetToDefault();
      return;
    }
    const title = (client.group_name || '').trim();
    const slogan = (client.slogan || '').trim();
    if (title) {
      this.updateText(title);
    }
    if (slogan) {
      this.updateSlogan(slogan);
    }
  }
}

// 导出便捷方法
export const brandingConfig = BrandingConfigManager.getInstance();

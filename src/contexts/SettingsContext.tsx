import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SocialLink {
  platform: 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'telegram' | 'linkedin';
  value: string;
  enabled: boolean;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  robotsIndex: boolean;
}

export interface PlatformSettings {
  name: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  seo: SeoSettings;
  socialLinks: SocialLink[];
  whatsappNumber: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  timezone: string;
}

const defaultSettings: PlatformSettings = {
  name: 'House Of Quran Academy | أكاديمية بيت القران',
  description: 'House Of Quran Academy | أكاديمية بيت القران - منصة تعليم القرآن الكريم واللغة العربية أونلاين بجلسات مباشرة ومناهج متكاملة.',
  logoUrl: '/logo.jpeg',
  faviconUrl: '/logo.jpeg',
  primaryColor: '#369589',
  secondaryColor: '#0f172a',
  accentColor: '#06b6d4',
  fontFamily: 'Almarai',
  seo: {
    metaTitle: 'House Of Quran Academy | أكاديمية بيت القران',
    metaDescription: 'منصة تعليم القرآن الكريم واللغة العربية أونلاين بجلسات مباشرة ومناهج متكاملة.',
    keywords: 'House Of Quran, أكاديمية بيت القران, Quran Academy, Quran Learning, تعليم القرآن, Arabic Learning, LMS',
    ogImage: '/logo.jpeg',
    robotsIndex: true,
  },
  socialLinks: [
    { platform: 'whatsapp', value: '', enabled: false },
    { platform: 'facebook', value: '', enabled: false },
    { platform: 'instagram', value: '', enabled: false },
    { platform: 'twitter', value: '', enabled: false },
    { platform: 'youtube', value: '', enabled: false },
    { platform: 'tiktok', value: '', enabled: false },
    { platform: 'telegram', value: '', enabled: false },
    { platform: 'linkedin', value: '', enabled: false },
  ],
  whatsappNumber: '',
  email: '',
  phone: '',
  address: '',
  currency: 'SAR',
  timezone: 'Africa/Cairo',
};

interface SettingsContextType {
  settings: PlatformSettings;
  updateSettings: (partial: Partial<PlatformSettings>) => void;
  updateSeo: (seo: Partial<SeoSettings>) => void;
  updateSocialLink: (platform: SocialLink['platform'], data: Partial<SocialLink>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const STORAGE_KEY = 'platform_settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch { }
    return defaultSettings;
  });

  useEffect(() => {
    applyTheme(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const applyTheme = (s: PlatformSettings) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', s.primaryColor);
    root.style.setProperty('--color-primary-dark', adjustColor(s.primaryColor, -20));
    root.style.setProperty('--color-primary-light', adjustColor(s.primaryColor, 30));
    root.style.setProperty('--color-accent', s.accentColor);

    const fontMap: Record<string, string> = {
      'Almarai': 'https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap',
      'Cairo': 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&display=swap',
      'Tajawal': 'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap',
      'Noto Kufi Arabic': 'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;600;700&display=swap',
      'IBM Plex Sans Arabic': 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap',
    };

    const existingLink = document.getElementById('dynamic-font') as HTMLLinkElement;
    const fontUrl = fontMap[s.fontFamily];
    if (fontUrl) {
      if (existingLink) {
        existingLink.href = fontUrl;
      } else {
        const link = document.createElement('link');
        link.id = 'dynamic-font';
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }
      document.body.style.fontFamily = `'${s.fontFamily}', sans-serif`;
    }

    if (s.faviconUrl) {
      let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = s.faviconUrl;
    }

    document.title = s.seo.metaTitle || s.name;
    setMetaTag('description', s.seo.metaDescription || s.description, 'name');
    setMetaTag('keywords', s.seo.keywords, 'name');
    setMetaTag('robots', s.seo.robotsIndex ? 'index, follow' : 'noindex, nofollow', 'name');
    setMetaTag('og:title', s.seo.metaTitle || s.name, 'property');
    setMetaTag('og:description', s.seo.metaDescription || s.description, 'property');
    setMetaTag('og:image', s.seo.ogImage || s.logoUrl || '/logo.jpeg', 'property');
    setMetaTag('twitter:title', s.seo.metaTitle || s.name, 'name');
    setMetaTag('twitter:description', s.seo.metaDescription || s.description, 'name');
    setMetaTag('twitter:image', s.seo.ogImage || s.logoUrl || '/logo.jpeg', 'name');
  };

  const setMetaTag = (key: string, content: string, attr: 'name' | 'property') => {
    if (!content) return;
    let tag = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, key);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  const adjustColor = (hex: string, amount: number): string => {
    try {
      const num = parseInt(hex.replace('#', ''), 16);
      const r = Math.min(255, Math.max(0, (num >> 16) + amount));
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
      const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    } catch {
      return hex;
    }
  };

  const updateSettings = (partial: Partial<PlatformSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const updateSeo = (seo: Partial<SeoSettings>) => {
    setSettings(prev => ({ ...prev, seo: { ...prev.seo, ...seo } }));
  };

  const updateSocialLink = (platform: SocialLink['platform'], data: Partial<SocialLink>) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(l => l.platform === platform ? { ...l, ...data } : l),
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, updateSeo, updateSocialLink, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

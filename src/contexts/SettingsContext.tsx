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
  name: 'House of Quran Academy',
  description: 'Modern learning management platform for students, teachers, parents, and academy admins.',
  logoUrl: '/logo.jpeg',
  faviconUrl: '/logo.jpeg',
  primaryColor: '#369589',
  secondaryColor: '#0f172a',
  accentColor: '#06b6d4',
  fontFamily: 'Almarai',
  seo: {
    metaTitle: 'House of Quran Academy | أكاديمية بيت القران | Learning Management System',
    metaDescription: 'House of Quran Academy - أكاديمية بيت القران is a modern learning management platform for students, teachers, parents, and academy admins.',
    keywords: 'House of Quran Academy, أكاديمية بيت القران, LMS, learning management system, online education, courses, students, teachers, academy',
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
  timezone: 'Asia/Riyadh',
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
const LEGACY_NAMES = ['Neovidia', 'Neovidia Academy', 'أكاديمية نيوفيديا'];

const normalizeSettings = (settings: PlatformSettings): PlatformSettings => {
  const seo = { ...defaultSettings.seo, ...settings.seo };
  const hasLegacyName = !settings.name || LEGACY_NAMES.includes(settings.name);

  if (!seo.metaTitle || LEGACY_NAMES.some(name => seo.metaTitle.includes(name))) {
    seo.metaTitle = defaultSettings.seo.metaTitle;
  }

  if (!seo.metaDescription || seo.metaDescription.includes('Ù')) {
    seo.metaDescription = defaultSettings.seo.metaDescription;
  }

  if (!seo.keywords || seo.keywords.includes('Ù') || seo.keywords.includes('Ø')) {
    seo.keywords = defaultSettings.seo.keywords;
  }

  if (!seo.ogImage) {
    seo.ogImage = defaultSettings.seo.ogImage;
  }

  return {
    ...settings,
    name: hasLegacyName ? defaultSettings.name : settings.name,
    description: !settings.description || settings.description.includes('Ù') ? defaultSettings.description : settings.description,
    logoUrl: settings.logoUrl || defaultSettings.logoUrl,
    faviconUrl: settings.faviconUrl || defaultSettings.faviconUrl,
    seo,
  };
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return normalizeSettings({ ...defaultSettings, ...parsed, seo: { ...defaultSettings.seo, ...parsed.seo } });
      }
    } catch { }
    return normalizeSettings(defaultSettings);
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

    document.title = s.seo.metaTitle || s.name;
    setLinkTag('icon', s.faviconUrl || s.logoUrl);
    setLinkTag('apple-touch-icon', s.logoUrl);
    setMetaTag('name', 'description', s.seo.metaDescription || s.description);
    setMetaTag('name', 'keywords', s.seo.keywords);
    setMetaTag('name', 'author', s.name);
    setMetaTag('name', 'robots', s.seo.robotsIndex ? 'index, follow' : 'noindex, nofollow');
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', s.name);
    setMetaTag('property', 'og:title', s.seo.metaTitle || s.name);
    setMetaTag('property', 'og:description', s.seo.metaDescription || s.description);
    setMetaTag('property', 'og:image', s.seo.ogImage || s.logoUrl);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', s.seo.metaTitle || s.name);
    setMetaTag('name', 'twitter:description', s.seo.metaDescription || s.description);
    setMetaTag('name', 'twitter:image', s.seo.ogImage || s.logoUrl);
  };

  const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
    if (!content) return;
    let tag = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, key);
      document.head.appendChild(tag);
    }
    tag.content = content;
  };

  const setLinkTag = (rel: string, href: string) => {
    if (!href) return;
    let tag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    if (!tag) {
      tag = document.createElement('link');
      tag.rel = rel;
      document.head.appendChild(tag);
    }
    tag.href = href;
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

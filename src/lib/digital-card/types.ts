export type DigitalCardIcon = "phone" | "email" | "globe" | "shield";

export type DigitalCardLink = {
  label: string;
  href: string;
  display: string;
  icon: DigitalCardIcon;
};

export type DigitalCardTheme = {
  accent: string;
  accentHover: string;
};

export type DigitalCardDefinition = {
  slug: string;
  name: string;
  familyName: string;
  givenName: string;
  org: string;
  title: string;
  subtitle?: string;
  subtitles?: string[];
  phone: string;
  email: string;
  links: DigitalCardLink[];
  vcardNote?: string;
  vcardDownloadName: string;
  footerLogo: string;
  metaDescription: string;
  theme?: DigitalCardTheme;
};

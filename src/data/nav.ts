export const hlsSource =
  'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';

export const pmOsThesisUrl =
  'https://www.notion.so/AI-PM-Course-Structure-3476fe2ecf3780efb887d6b533c95974?pvs=21';

export type NavLink = {
  label: string;
  target: string;
};

export const navLinks = [
  { label: 'Hero', target: 'hero' },
  { label: 'Experience & Education', target: 'experience-education' },
  { label: 'Projects', target: 'projects' },
  { label: 'Teaching, Speaking & Writing', target: 'thoughts' },
  { label: 'Contact', target: 'contact' },
  { label: 'Bonus', target: 'bonus' },
  { label: 'AI Ramin', target: 'ai-ramin' },
] as const satisfies readonly NavLink[];

export const roles = ['Manager', 'Teacher', 'Engineer'] as const;

// Visitor destinations are independent of the seven legacy section identifiers.
export const portfolioDestinations = [
  { label: 'Home', target: 'hero', href: '/', icon: 'intro' },
  { label: 'Work', target: 'experience-education', href: '/experience-education', icon: 'work' },
  { label: 'Products', target: 'projects', href: '/projects', icon: 'projects' },
  { label: 'Teaching & speaking', target: 'thoughts', href: '/thoughts', icon: 'thoughts' },
  { label: 'About & writing', target: 'about', href: '/about', icon: 'intro' },
  { label: 'Contact', target: 'contact', href: '/contact', icon: 'contact' },
  { label: 'Resources', target: 'resources', href: '/resources', icon: 'bonus', utility: true },
  { label: 'AI Ramin', target: 'ai-ramin', href: '/ai-ramin', icon: 'ai', utility: true },
] as const;

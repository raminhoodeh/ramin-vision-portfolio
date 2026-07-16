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

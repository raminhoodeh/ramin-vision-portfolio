import {
  deepDives,
  portfolioContent,
  projectCaseStudies,
  toolsAndSystems,
} from '../data/portfolio';

export type DeepDiveItem = (typeof deepDives)[number];
export type WorkItem = (typeof projectCaseStudies)[number];
export type ToolSystemEntry = (typeof toolsAndSystems)[number];
export type AssetSlotItem = DeepDiveItem['assetSlots'][number];
export type ProductManagementWorkExperience =
  (typeof portfolioContent.productManagementWorkExperiences.companies)[number];
export type PersonalProjectEntry =
  | (typeof portfolioContent.personalProjects.selfware)[number]
  | (typeof portfolioContent.personalProjects.tools)[number];
export type TeachingEntry = (typeof portfolioContent.teachingSpeakingWriting.teaching)[number];
export type SpeakingEntry = (typeof portfolioContent.teachingSpeakingWriting.speaking)[number];
export type BookEntry = (typeof portfolioContent.teachingSpeakingWriting.writing.books)[number];
export type WritingCaseStudyEntry = (typeof portfolioContent.teachingSpeakingWriting.writing.caseStudies)[number];
export type ThoughtFoundationEntry = (typeof portfolioContent.teachingSpeakingWriting.foundations.foundations)[number];
export type ThoughtArchitectureApplication =
  (typeof portfolioContent.teachingSpeakingWriting.architectureBridge.applications)[number];
export type CaseWriteupLineageItem = { label: string; value: string };

export const toolLayerColumns = ['Model', 'Context', 'Orchestration', 'Governance', 'Human'] as const;

export type StackLayerName = (typeof toolLayerColumns)[number];
export type ThoughtStackComparisonRow = {
  projectName: string;
  descriptor: string;
  kind: 'Product' | 'Tool';
  foundation: string;
  outcome: string;
  source: string;
  layers: Record<StackLayerName, string>;
};
export type BonusGiftEntry = (typeof portfolioContent.bonus.gifts)[number];

export type CaseStudyEntry = {
  id: string;
  tag?: string;
  typeLabel: string;
  eyebrow: string;
  title: string;
  summary: string;
  readTime: string;
  year: string;
  status: string;
  sourceStatus: string;
  heroImage?: string;
  cardSpan?: string;
  cardAspect?: string;
  sections: readonly { label: string; body: readonly string[] }[];
  chips: readonly { label: string; value: string; sourceStatus?: string }[];
  structure: readonly { label: string; value: string }[];
  links: readonly { label: string; href: string; sourceStatus?: string }[];
  assetSlots: readonly { label: string; note: string; sourceStatus?: string }[];
  related: readonly string[];
};


export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  rank: 'Commander' | 'Lead Scientist' | 'Junior Intel';
  verified: boolean;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  type: 'text' | 'image' | 'code' | 'system';
  timestamp: Date;
  groundingUrls?: Array<{title: string, uri: string}>;
  imageData?: string;
}

export enum AppView {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  LIVE = 'live',
  DATA_CLEANER = 'cleaner',
  VISION = 'vision',
  GROUNDING = 'grounding',
  ARCHITECT = 'architect',
  SYNTHETIC = 'synthetic',
  AUTO_EDA = 'eda',
  DEVOPS = 'devops',
  SECURITY = 'security',
  NOTEBOOK = 'notebook',
  AUTOML = 'automl',
  KAGGLE_HUB = 'kaggle_hub',
  CAREER = 'career',
  SETTINGS = 'settings'
}

export interface DataMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'error';
}

export interface NotebookCell {
  id: string;
  type: 'code' | 'markdown';
  content: string;
  output?: string;
  isExecuting?: boolean;
}

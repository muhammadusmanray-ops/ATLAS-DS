export enum AuthState {
  IDLE = 'IDLE',
  WELCOME = 'WELCOME',
  EMAIL_INPUT = 'EMAIL_INPUT',
  PASSWORD_LOGIN = 'PASSWORD_LOGIN',
  PASSWORD_SIGNUP = 'PASSWORD_SIGNUP',
  AUTHENTICATED = 'AUTHENTICATED',
  OTP_VERIFY = 'OTP_VERIFY'
}

export interface User {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
  rank?: 'Commander' | 'Lead Scientist' | 'Junior Intel';
  verified: boolean;
  provider?: 'email' | 'google' | 'local';
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  type: 'text' | 'image' | 'code' | 'system' | 'dataset' | 'intel_node';
  timestamp: Date;
  groundingUrls?: Array<{ title: string, uri: string }>;
  imageData?: string;
  metadata?: { provider: string };
}

export interface ChatSession {
  id: string;
  userId?: string;
  moduleId: string;
  title: string;
  lastUpdated: Date;
  preview: string;
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
  SETTINGS = 'settings',
  DEEP_RESEARCH = 'deep_research'
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

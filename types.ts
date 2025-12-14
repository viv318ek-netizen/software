export interface GeneratedResponse {
  html: string;
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum DeviceView {
  DESKTOP = 'w-full',
  TABLET = 'w-[768px]',
  MOBILE = 'w-[375px]'
}

export enum Tab {
  PREVIEW = 'preview',
  CODE = 'code'
}

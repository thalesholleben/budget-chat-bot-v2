export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'quote' | 'pix';
  value?: number | null;
  pixKey?: string | null;
  pixType?: 'CPF' | 'Celular' | 'Email' | null;
}

export interface WebhookRequest {
  session_id: string;
  message: string;
  firstmsg: boolean;
}

export interface WebhookResponse {
  message: string;
  type: 'text' | 'quote' | 'pix';
  value: number | null;
  pixKey?: string | null;
  pixType?: 'CPF' | 'Celular' | 'Email' | null;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
}

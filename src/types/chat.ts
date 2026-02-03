export interface PriceItem {
  name: string;
  price: number | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'quote' | 'pix' | 'price_table';
  value?: number | null;
  pixKey?: string | null;
  pixType?: 'CPF' | 'Celular' | 'Email' | null;
  priceItems?: PriceItem[] | null;
  showTotal?: boolean;
}

export interface WebhookRequest {
  session_id: string;
  message: string;
  firstmsg: boolean;
  business_rules?: string;
  business_rules_hash?: string;
}

export interface WebhookResponse {
  message: string;
  type: 'text' | 'quote' | 'pix' | 'price_table';
  value: number | null;
  pixKey?: string | null;
  pixType?: 'CPF' | 'Celular' | 'Email' | null;
  priceItems?: PriceItem[] | null;
  showTotal?: boolean;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
}

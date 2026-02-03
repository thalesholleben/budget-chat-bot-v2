import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage, WebhookRequest, WebhookResponse, ChatSession } from '@/types/chat';
import { getEnv } from '@/lib/env';
import CryptoJS from 'crypto-js';

// Usar endpoint local - Nginx fará proxy para webhook externo
const WEBHOOK_URL = '/api/webhook';
const STORAGE_KEY = 'chat_session';

// Constantes de validação
const MAX_MESSAGE_LENGTH = 5000;
const MIN_MESSAGE_LENGTH = 1;

const generateId = () => Math.random().toString(36).substring(2, 15);

const generateSessionId = () => `session_${Date.now()}_${generateId()}`;

/**
 * Gera ou recupera chave de criptografia única por navegador
 */
const getEncryptionKey = (): string => {
  const KEY_STORAGE = 'chat_encryption_key';
  let key = localStorage.getItem(KEY_STORAGE);

  if (!key) {
    // Gerar chave aleatória de 256 bits (32 bytes)
    key = CryptoJS.lib.WordArray.random(32).toString();
    localStorage.setItem(KEY_STORAGE, key);
  }

  return key;
};

const ENCRYPTION_KEY = getEncryptionKey();

/**
 * Criptografa dados usando AES-256
 */
const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

/**
 * Descriptografa dados usando AES-256
 */
const decryptData = (encrypted: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch {
    return null;
  }
};

/**
 * Sanitiza entrada do usuário removendo caracteres de controle
 * e normalizando espaços múltiplos
 */
const sanitizeInput = (input: string): string => {
  // Remove caracteres de controle exceto newline/tab
  const sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  // Normaliza espaços múltiplos
  return sanitized.replace(/\s+/g, ' ').trim();
};

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Carregar sessão do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        // Descriptografar antes de usar
        const decrypted = decryptData(stored);

        if (!decrypted) {
          throw new Error('Falha na descriptografia');
        }

        const session: ChatSession = JSON.parse(decrypted);
        setSessionId(session.id);
        setMessages(session.messages.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } catch {
        // Se falhar, iniciar nova sessão
        startNewSession();
      }
    } else {
      startNewSession();
    }
  }, []);

  // Salvar sessão no localStorage com debounce
  useEffect(() => {
    // Limpar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (sessionId && messages.length > 0) {
      // Debounce de 500ms
      saveTimeoutRef.current = setTimeout(() => {
        const session: ChatSession = {
          id: sessionId,
          messages,
          createdAt: new Date()
        };
        // Criptografar antes de salvar
        const encrypted = encryptData(JSON.stringify(session));
        localStorage.setItem(STORAGE_KEY, encrypted);
      }, 500);
    }

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [sessionId, messages]);

  const startNewSession = useCallback(() => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setMessages([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const sendMessage = useCallback(async (content: string, isFirstMessage: boolean = false) => {
    if (!content.trim() || isLoading) return;

    // Sanitizar entrada
    const sanitized = sanitizeInput(content);

    // Validar tamanho mínimo
    if (sanitized.length < MIN_MESSAGE_LENGTH) {
      setError('Mensagem muito curta');
      return;
    }

    // Validar tamanho máximo
    if (sanitized.length > MAX_MESSAGE_LENGTH) {
      setError(`Mensagem muito longa (máximo ${MAX_MESSAGE_LENGTH} caracteres)`);
      return;
    }

    setError(null);

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: sanitized,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const payload: WebhookRequest = {
        session_id: sessionId,
        message: sanitized,
        firstmsg: isFirstMessage
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status}`);
      }

      const data: WebhookResponse = await response.json();

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        type: data.type || 'text',
        value: data.value,
        pixKey: data.pixKey,
        pixType: data.pixType
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com o servidor');
      // Mensagem de fallback para demonstração
      const fallbackMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Desculpe, não foi possível conectar ao servidor. Configure a URL do webhook para começar.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, sessionId, isLoading]);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    startNewSession
  };
};

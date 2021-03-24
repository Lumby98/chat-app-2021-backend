import { ChatMessage } from '../models/chat-message.model';
import { ChatClient } from '../models/chat-client.model';

export const IChatServiceProvider = 'IChatServiceProvider';
export interface IChatService {
  newMessage(message: string, clientId: string): Promise<ChatMessage>;

  newClient(id: string, nickname: string): Promise<ChatClient>;

  getClients(): Promise<ChatClient[]>;

  getMessages(): Promise<ChatMessage[]>;

  delete(id: string): Promise<void>;

  updateTyping(typing: boolean, id: string): ChatClient;
}

import { ChatClient } from '../../core/models/chat-client.model';
import { ChatMessage } from '../../core/models/chat-message.model';

export interface WelcomeDto {
  clients: ChatClient[];
  client: ChatClient;
  messages: ChatMessage[];
}

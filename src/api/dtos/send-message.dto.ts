import { ChatClient } from '../../core/models/chat-client.model';

export interface SendMessageDto {
  message: string;
  client: ChatClient;
}

import { Injectable } from '@nestjs/common';
import { ChatClient } from '../models/chat-client.model';
import { ChatMessage } from '../models/chat-message.model';
import { IChatService } from '../primary-ports/chat.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '../../infrastructure/client.entity';
import { Repository } from 'typeorm';
import { Message } from '../../infrastructure/message.entity';

@Injectable()
export class ChatService implements IChatService {
  private allMessages: ChatMessage[] = [];
  private clients: ChatClient[] = [];

  constructor(
    @InjectRepository(Client) private clientRepository: Repository<Client>,
    @InjectRepository(Message) private messageRepository: Repository<Message>,
  ) {}

  async newMessage(message: string, clientId: string): Promise<ChatMessage> {
    const client = await this.clientRepository.findOne({ id: clientId });

    let messageDB = this.messageRepository.create();
    messageDB.message = message;
    messageDB.nickname = client.nickname;
    messageDB.timeStamp = new Date(Date.now());
    messageDB = await this.messageRepository.save(messageDB);

    return {
      message: messageDB.message,
      sender: messageDB.nickname,
      timeStamp: messageDB.timeStamp,
    };
  }

  async newClient(id: string, nickname: string): Promise<ChatClient> {
    const clientDB = await this.clientRepository.findOne({
      nickname: nickname,
    });
    if (!clientDB) {
      let client = this.clientRepository.create();
      client.id = id;
      client.nickname = nickname;
      client = await this.clientRepository.save(client);
      return { id: client.id, nickname: client.nickname };
    }
    if (clientDB.id == id) {
      return { id: clientDB.id, nickname: clientDB.nickname };
    } else {
      throw new Error('This nickname is already in use');
    }
  }

  async getClients(): Promise<ChatClient[]> {
    const clients = await this.clientRepository.find();
    const chatClients: ChatClient[] = JSON.parse(JSON.stringify(clients));
    return chatClients;
  }

  async getMessages(): Promise<ChatMessage[]> {
    const messages = await this.messageRepository.find();
    const chatMessages: ChatMessage[] = JSON.parse(JSON.stringify(messages));
    console.log(chatMessages);
    return chatMessages;
  }

  async delete(id: string): Promise<void> {
    await this.clientRepository.delete({ id: id });
  }

  updateTyping(typing: boolean, id: string): ChatClient {
    const chatClient = this.clients.find((c) => c.id === id);
    if (chatClient && chatClient.typing !== typing) {
      chatClient.typing = typing;
      return chatClient;
    }
  }
}

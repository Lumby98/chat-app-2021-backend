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

  async newClient(chatClient: ChatClient): Promise<ChatClient> {
    const chatClientFoundById = await this.clientRepository.findOne({
      id: chatClient.id,
    });
    if (chatClientFoundById) {
      return JSON.parse(JSON.stringify(chatClientFoundById));
    }

    const chatClientFoundByNickname = await this.clientRepository.findOne({
      nickname: chatClient.nickname,
    });
    if (chatClientFoundByNickname) {
      throw new Error('This nickname is already in use');
    }
    let client = this.clientRepository.create();
    client.nickname = chatClient.nickname;
    client = await this.clientRepository.save(client);
    const newChatClient = JSON.parse(JSON.stringify(client));
    this.clients.push(newChatClient);
    return newChatClient;
  }

  async getClients(): Promise<ChatClient[]> {
    const clients = await this.clientRepository.find();
    const chatClients: ChatClient[] = JSON.parse(JSON.stringify(clients));
    return chatClients;
  }

  async getMessages(): Promise<ChatMessage[]> {
    const messages = await this.messageRepository.find();
    const chatMessages: ChatMessage[] = [];
    for (const message of messages) {
      chatMessages.push({
        message: message.message,
        sender: message.nickname,
        timeStamp: message.timeStamp,
      });
    }
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

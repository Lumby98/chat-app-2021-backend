import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WelcomeDto } from '../dtos/welcome.dto';
import { Inject } from '@nestjs/common';
import {
  IChatService,
  IChatServiceProvider,
} from '../../core/primary-ports/chat.service.interface';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(IChatServiceProvider) private chatService: IChatService,
  ) {}

  @WebSocketServer() server;

  @SubscribeMessage('message')
  async handleChatEvent(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const chatMessage = await this.chatService.newMessage(message, client.id);
    this.server.emit('newMessages', chatMessage);
  }

  @SubscribeMessage('typing')
  handleTypingEvent(
    @MessageBody() typing: boolean,
    @ConnectedSocket() client: Socket,
  ): void {
    const chatClient = this.chatService.updateTyping(typing, client.id);
    if (chatClient) {
      this.server.emit('clientTyping', chatClient);
    }
  }

  @SubscribeMessage('nickname')
  async handleNicknameEvent(
    @MessageBody() nickname: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const chatClient = await this.chatService.newClient(client.id, nickname);
      const chatClients = await this.chatService.getClients();
      const chatMessages = await this.chatService.getMessages();
      const welcome: WelcomeDto = {
        clients: chatClients,
        messages: chatMessages,
        client: chatClient,
      };
      console.log(welcome);
      client.emit('welcome', welcome);
      this.server.emit('clients', chatClients);
    } catch (e) {
      client.error(e.message);
    }
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<any> {
    client.emit('allMessages', await this.chatService.getMessages());
    this.server.emit('clients', await this.chatService.getClients());
  }

  async handleDisconnect(client: Socket): Promise<any> {
    await this.chatService.delete(client.id);
    this.server.emit('clients', await this.chatService.getClients());
  }
}

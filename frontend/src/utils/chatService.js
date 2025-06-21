import { LocalStorage } from './storage';

export class ChatService {
  constructor(client) {
    this.client = client;
  }

  async loadChats(phone, forceUpdate = false) {
    try {
      // 1. Проверка кеша
      if (!forceUpdate) {
        const cached = LocalStorage.get(`chats_${phone}`);
        if (cached) return cached;
      }

      // 2. Загрузка из WhatsApp
      const chats = await this.client.getChats();
      
      // 3. Обработка и фильтрация
      const processed = chats
        .filter(chat => this.filterChat(chat))
        .map(chat => this.mapChat(chat))
        .slice(0, 200); // Лимит для производительности

      // 4. Сохранение в кеш
      LocalStorage.set(`chats_${phone}`, processed);
      return processed;

    } catch (error) {
      console.error('ChatService error:', error);
      throw error;
    }
  }

  filterChat(chat) {
    return !chat.isReadOnly && 
           !chat.id.includes('status') &&
           (chat.isGroup || chat.unreadCount > 0);
  }

  mapChat(chat) {
    return {
      id: chat.id._serialized,
      name: chat.name || chat.id.user,
      isGroup: chat.isGroup,
      lastMessage: chat.lastMessage?.body,
      timestamp: chat.lastMessage?.timestamp,
      unreadCount: chat.unreadCount
    };
  }

  async refreshChats(phone) {
    return this.loadChats(phone, true);
  }
}
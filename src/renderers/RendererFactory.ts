import { GameRenderer, RendererType } from '../types';

export class RendererFactory {
  private static renderers: Map<RendererType, GameRenderer> = new Map();

  /**
   * Регистрирует новый рендерер
   */
  static register(type: RendererType, renderer: GameRenderer) {
    this.renderers.set(type, renderer);
  }

  /**
   * Получает рендерер по типу
   */
  static get(type: RendererType): GameRenderer {
    const renderer = this.renderers.get(type);
    if (!renderer) {
      throw new Error(`Renderer type '${type}' not found. Available types: ${this.getAvailableTypes().join(', ')}`);
    }
    return renderer;
  }

  /**
   * Возвращает список доступных типов рендереров
   */
  static getAvailableTypes(): RendererType[] {
    return Array.from(this.renderers.keys());
  }

  /**
   * Проверяет, зарегистрирован ли рендерер
   */
  static has(type: RendererType): boolean {
    return this.renderers.has(type);
  }

  /**
   * Удаляет рендерер
   */
  static unregister(type: RendererType): boolean {
    return this.renderers.delete(type);
  }

  /**
   * Очищает все рендереры
   */
  static clear() {
    this.renderers.clear();
  }
} 
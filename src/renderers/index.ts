import { RendererFactory } from './RendererFactory';
import { ClassicRenderer } from './ClassicRenderer';
import { MinimalRenderer } from './MinimalRenderer';
import { DarkRenderer } from './DarkRenderer';
import { AutomataRenderer } from './AutomataRenderer';

// Регистрируем все доступные рендереры
RendererFactory.register('classic', new ClassicRenderer());
RendererFactory.register('minimal', new MinimalRenderer());
RendererFactory.register('dark', new DarkRenderer());
RendererFactory.register('automata', new AutomataRenderer());

// Экспортируем фабрику и типы рендереров
export { RendererFactory } from './RendererFactory';
export { ClassicRenderer } from './ClassicRenderer';
export { MinimalRenderer } from './MinimalRenderer';
export { DarkRenderer } from './DarkRenderer';
export { AutomataRenderer } from './AutomataRenderer';

// Экспортируем типы
export type { GameRenderer } from '../types';
export type { RendererType } from '../types'; 
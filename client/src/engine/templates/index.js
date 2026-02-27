import template001 from './template001';
import template002 from './template002';
import template003 from './template003';
import template004 from './template004';

export const TEMPLATES = [template001, template002, template003, template004];

export function getTemplateById(id) {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}

export { template001, template002, template003, template004 };

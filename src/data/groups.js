import { apartments } from './apartments';
import { rules } from './rules';

// Parent groups derived from extracted logements
export const PARENT_GROUPS = apartments.map(apt => ({
  id: apt.id,
  label: `${apt.ref} — ${apt.type}`,
  taskId: 'ext_logements',
}));

// Mock instance-level parent assignments
// A child instance can belong to multiple parents (e.g. a door between two rooms)
const portesRule   = rules.find(r => r.id === 'r_porte_entree');
const intPorteRule = rules.find(r => r.id === 'r_portes_interieures');

export const INSTANCE_PARENTS = {
  // Entry doors: one parent each
  p1:  ['A101'],
  p2:  ['A102'],
  p3:  ['A201'],
  // Interior doors: pi2 is shared between A101 and A102 (between-unit door)
  pi1: ['A101'],
  pi2: ['A101', 'A102'],
  pi3: ['A102'],
  pi4: ['A201'],
};

// All instances with their source task and rule
export function getAllInstances() {
  const items = [];
  if (portesRule?.instances) {
    portesRule.instances.forEach(inst =>
      items.push({ ...inst, taskId: 'ext_portes', unit: 'm' })
    );
  }
  if (intPorteRule?.instances) {
    intPorteRule.instances.forEach(inst =>
      items.push({ ...inst, taskId: 'ext_portes', unit: 'm' })
    );
  }
  return items;
}

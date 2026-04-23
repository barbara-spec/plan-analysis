import { useState } from 'react';
import { PARENT_GROUPS, INSTANCE_PARENTS, getAllInstances } from '../../data/groups';
import { extractionTasks } from '../../data/extractionTasks';

function ParentTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
      {label}
      <button onClick={onRemove} className="text-gray-400 hover:text-gray-600 leading-none">×</button>
    </span>
  );
}

export default function GroupedResults({ taskParents }) {
  // taskParents: { [childTaskId]: parentTaskId }
  const [assignments, setAssignments] = useState(INSTANCE_PARENTS);

  const childTaskIds = Object.keys(taskParents).filter(id => taskParents[id]);
  if (childTaskIds.length === 0) return null;

  const allInstances = getAllInstances();
  const parentTask = extractionTasks.find(t => t.id === taskParents[childTaskIds[0]]);

  const addParent = (instanceId, parentId) => {
    setAssignments(prev => {
      const cur = prev[instanceId] ?? [];
      if (cur.includes(parentId)) return prev;
      return { ...prev, [instanceId]: [...cur, parentId] };
    });
  };

  const removeParent = (instanceId, parentId) => {
    setAssignments(prev => ({
      ...prev,
      [instanceId]: (prev[instanceId] ?? []).filter(p => p !== parentId),
    }));
  };

  // Group instances by their first parent for display
  const grouped = {};
  PARENT_GROUPS.forEach(pg => { grouped[pg.id] = []; });
  grouped['__unassigned'] = [];

  allInstances.forEach(inst => {
    const parents = assignments[inst.id] ?? [];
    if (parents.length === 0) {
      grouped['__unassigned'].push(inst);
    } else {
      parents.forEach(pid => {
        if (grouped[pid]) grouped[pid].push(inst);
      });
    }
  });

  const unassignedParentIds = PARENT_GROUPS
    .filter(pg => !Object.values(assignments).flat().includes(pg.id))
    .map(pg => pg.id);

  return (
    <div className="border-t border-gray-100 px-4 py-3">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Groupements</span>
        {parentTask && (
          <span className="text-xs text-gray-400">
            → rattachés à <span className="font-medium text-gray-600">{parentTask.label}</span>
          </span>
        )}
      </div>

      <div className="space-y-2">
        {PARENT_GROUPS.map(pg => {
          const children = grouped[pg.id] ?? [];
          return (
            <div key={pg.id} className="border border-gray-100 rounded-lg overflow-hidden">
              {/* Parent row */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
                <span className="text-xs font-semibold text-gray-700">{pg.label}</span>
                <span className="text-xs text-gray-400 ml-auto">{children.length} élément{children.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Children */}
              {children.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {children.map(inst => {
                    const instParents = assignments[inst.id] ?? [];
                    const availableParents = PARENT_GROUPS.filter(p => !instParents.includes(p.id));
                    return (
                      <div key={`${pg.id}-${inst.id}`} className="flex items-center gap-2 px-3 py-1.5 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                        <span className="text-xs font-mono text-gray-600 flex-shrink-0">{inst.ref}</span>
                        <span className={`text-xs font-mono font-semibold flex-shrink-0 ${inst.pass ? 'text-gray-700' : 'text-red-500'}`}>
                          {inst.value} {inst.unit}
                        </span>
                        {/* Multi-parent tags */}
                        {instParents.length > 1 && instParents
                          .filter(pid => pid !== pg.id)
                          .map(pid => {
                            const pg2 = PARENT_GROUPS.find(p => p.id === pid);
                            return pg2 ? (
                              <ParentTag
                                key={pid}
                                label={pg2.label}
                                onRemove={() => removeParent(inst.id, pid)}
                              />
                            ) : null;
                          })}
                        <div className="flex-1" />
                        {availableParents.length > 0 && (
                          <select
                            value=""
                            onChange={e => e.target.value && addParent(inst.id, e.target.value)}
                            className="text-xs border border-dashed border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-400 focus:outline-none hover:border-gray-300 transition-colors w-20 flex-shrink-0"
                          >
                            <option value="">+ parent</option>
                            {availableParents.map(p => (
                              <option key={p.id} value={p.id}>{p.label}</option>
                            ))}
                          </select>
                        )}
                        <button
                          onClick={() => removeParent(inst.id, pg.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors text-xs flex-shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Drop zone when empty */}
              {children.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-300 italic">
                  Aucun élément assigné
                </div>
              )}
            </div>
          );
        })}

        {/* Unassigned */}
        {grouped['__unassigned'].length > 0 && (
          <div className="border border-dashed border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-xs font-semibold text-gray-400">Non assignés</span>
              <span className="text-xs text-gray-300 ml-auto">{grouped['__unassigned'].length}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {grouped['__unassigned'].map(inst => (
                <div key={inst.id} className="flex items-center gap-2 px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200 flex-shrink-0 ml-1" />
                  <span className="text-xs font-mono text-gray-400">{inst.ref}</span>
                  <div className="flex-1" />
                  <select
                    value=""
                    onChange={e => e.target.value && addParent(inst.id, e.target.value)}
                    className="text-xs border border-dashed border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-400 focus:outline-none hover:border-gray-400 max-w-28"
                  >
                    <option value="">Assigner…</option>
                    {PARENT_GROUPS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

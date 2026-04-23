const INDIGO = '#5151cd';
const INK    = '#111827';
const MUTED  = '#9ca3af';

// ─── Build the tree from parent assignments ───────────────────────────────────

function buildTree(allElements, assignments) {
  const roots = [];
  const childrenOf = {};

  allElements.forEach(el => {
    const parentId = assignments[el.id];
    if (parentId) {
      if (!childrenOf[parentId]) childrenOf[parentId] = [];
      childrenOf[parentId].push(el);
    } else {
      roots.push(el);
    }
  });

  return { roots, childrenOf };
}

function TreeNode({ el, childrenOf, depth = 0 }) {
  const children = childrenOf[el.id] ?? [];
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 0', paddingLeft: depth * 16,
      }}>
        {depth > 0 && (
          <span style={{ color: '#d1d5db', fontSize: 12, flexShrink: 0 }}>└─</span>
        )}
        <span style={{
          fontSize: 11.5, fontWeight: depth === 0 ? 600 : 400,
          color: depth === 0 ? INK : '#374151',
        }}>{el.label}</span>
        {children.length > 0 && (
          <span style={{ fontSize: 10, color: MUTED }}>({children.length})</span>
        )}
      </div>
      {children.map(child => (
        <TreeNode key={child.id} el={child} childrenOf={childrenOf} depth={depth + 1} />
      ))}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function GroupingPanel({ elements, parentAssignments, onParentAssign, onBack }) {
  const { roots, childrenOf } = buildTree(elements, parentAssignments);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderLeft: '1px solid #f1f2f4' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f1f2f4', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, border: '1px solid #eef0f3', background: '#f9fafb', cursor: 'pointer', color: '#6b7280', fontSize: 14, flexShrink: 0 }}>←</button>
          <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>Hiérarchie des éléments</span>
        </div>
        <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, marginTop: 4, paddingLeft: 32 }}>
          Définissez les relations parent / enfant entre groupes d'éléments.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>

        {/* Assignment rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
          {elements.map(el => {
            const parentId = parentAssignments[el.id] ?? '';
            const possibleParents = elements.filter(p => p.id !== el.id);

            return (
              <div key={el.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                background: '#fafafa', border: '1px solid #f1f2f4', borderRadius: 8,
              }}>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: INK }}>{el.label}</span>
                <span style={{ fontSize: 11, color: MUTED, flexShrink: 0 }}>appartient à</span>
                <select
                  value={parentId}
                  onChange={e => onParentAssign(el.id, e.target.value || null)}
                  style={{
                    padding: '4px 8px', fontSize: 11, fontWeight: 500,
                    border: `1px solid ${parentId ? 'rgba(81,81,205,0.3)' : '#e5e7eb'}`,
                    borderRadius: 6, background: parentId ? 'rgba(81,81,205,0.05)' : 'white',
                    color: parentId ? INDIGO : '#6b7280',
                    cursor: 'pointer', outline: 'none',
                    maxWidth: 110,
                  }}
                >
                  <option value="">— Aucun</option>
                  {possibleParents.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {/* Tree preview */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Aperçu de la hiérarchie
          </p>
          {roots.length === 0 ? (
            <p style={{ fontSize: 11, color: MUTED, fontStyle: 'italic' }}>Aucune relation définie</p>
          ) : (
            <div style={{ background: '#fafafa', border: '1px solid #f1f2f4', borderRadius: 8, padding: '10px 12px' }}>
              {roots.map(el => (
                <TreeNode key={el.id} el={el} childrenOf={childrenOf} depth={0} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f2f4', flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{
            width: '100%', padding: '9px 0',
            background: INK, color: 'white',
            border: 'none', borderRadius: 8,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Valider la hiérarchie
        </button>
      </div>
    </div>
  );
}

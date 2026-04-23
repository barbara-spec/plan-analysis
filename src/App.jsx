import { useState, useRef } from 'react';
import Topbar from './components/layout/Topbar';
import Stepbar from './components/layout/Stepbar';
import PlanShell from './components/plan/PlanShell';
import DocSelector from './components/detection/DocSelector';
import ElementScopePanel from './components/scope/ElementScopePanel';
import ExtractionPanel from './components/extraction/ExtractionPanel';
import VerificationPanel from './components/verification/VerificationPanel';
import RuleInFocusPopover from './components/RuleInFocusPopover';
import PopoutPanel from './components/layout/PopoutPanel';
import { extractionTasks } from './data/extractionTasks';
import { EXTRACTION_RESULTS } from './data/extractionResults';
import { elementTypes as defaultElementTypes } from './data/elementTypes';
import { documents } from './data/documents';

const EXTRACTION_RESULTS_COUNT = Object.fromEntries(Object.entries(EXTRACTION_RESULTS).map(([k, v]) => [k, v.length]));
const ALL_INSTANCES = Object.values(EXTRACTION_RESULTS).flat();

// Reverse map: aptId → elementId (e.g. 'A101' → 'rooms')
const APT_TO_ELEMENT = {};
Object.entries(EXTRACTION_RESULTS).forEach(([elementId, instances]) => {
  instances.forEach(inst => { if (inst.planRef) APT_TO_ELEMENT[inst.planRef] = elementId; });
});

const RESULT_COUNTS = { ext_logements: 6, ext_portes: 7, ext_stationnement: 2 };

// ─── Rule evaluation engine ───────────────────────────────────────────────────

function parseRuleNum(str) {
  if (!str || str === '—') return null;
  const m = String(str).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

const RULE_META = {
  r_porte_entree:       { code: 'Art. L. 111-7',  track: 'A' },
  r_portes_interieures: { code: 'Art. L. 111-7',  track: 'A' },
  r_surface_ch:         { code: 'Art. R. 111-2',  track: 'B' },
  r_hsp_sdb:            { code: 'Art. R. 111-2',  track: 'B' },
  r_hsp_cuisine:        { code: 'Art. R. 111-2',  track: 'B' },
  r_eclairage:          { code: 'Art. R. 111-10', track: 'D' },
  r_eclairage_w:        { code: 'Art. R. 111-10', track: 'D' },
  r_cloisons:           { code: 'Art. R. 111-11', track: 'C' },
  r_marche:             { code: 'Art. R. 111-4',  track: 'A' },
  r_giron:              { code: 'Art. R. 111-4',  track: 'A' },
};

// Rules that can be evaluated from extracted data
const EVALUATABLE_RULES = {
  r_porte_entree: {
    check:      inst => { const w = parseRuleNum(inst.minWidth ?? inst.width); return w === null ? null : w >= 90; },
    threshold:  '90 cm',
    failDetail: inst => `${inst.label} — ${inst.minWidth ?? inst.width ?? '?'} mesuré, ≥ 90 cm requis`,
  },
  r_portes_interieures: {
    check:      inst => { const w = parseRuleNum(inst.minWidth ?? inst.width); return w === null ? null : w > 80; },
    threshold:  '80 cm',
    failDetail: inst => `${inst.label} — ${inst.minWidth ?? inst.width ?? '?'} mesuré, > 80 cm requis`,
  },
  r_surface_ch: {
    check:      inst => { const s = parseRuleNum(inst.surface); return s === null ? null : s >= 11; },
    threshold:  '11 m²',
    failDetail: inst => `${inst.label} — ${inst.surface ?? '?'} mesuré, ≥ 11 m² requis`,
  },
};

function computeEvaluations(elements, taskStates, visionResults, methodOverrides) {
  const results = [];

  const getInstances = (el) => {
    const method = methodOverrides[el.id] ?? el.method ?? 'text';
    if (method === 'vision' && taskStates[`vision_${el.id}`] === 'done') {
      // Normalise vision items to the same shape as extraction results
      return (visionResults[el.id] ?? []).map(item => ({
        ...item,
        minWidth: item.width ?? null,
      }));
    }
    return EXTRACTION_RESULTS[el.id] ?? [];
  };

  elements.filter(e => e.inScope).forEach(el => {
    const instances = getInstances(el);
    el.rules.filter(r => r.active).forEach(rule => {
      const meta    = RULE_META[rule.id] ?? { code: '—', track: 'A' };
      const checker = EVALUATABLE_RULES[rule.id];
      const base    = {
        id: `eval_${rule.id}`,
        ruleId: rule.id,
        ruleName: rule.label,
        ruleCode: meta.code,
        track: meta.track,
        nonCompliantElements: [],
      };

      if (!checker) {
        results.push({ ...base, status: 'review', observation: 'Données insuffisantes pour évaluation automatique.' });
        return;
      }
      if (!instances.length) {
        results.push({ ...base, status: 'review', observation: `Aucun ${el.label.toLowerCase()} identifié.` });
        return;
      }

      const evaluated = instances.map(inst => ({ inst, pass: checker.check(inst) }));
      if (evaluated.every(r => r.pass === null)) {
        results.push({ ...base, status: 'review', observation: 'Métriques non disponibles pour cette règle.' });
        return;
      }

      const fails = evaluated.filter(r => r.pass === false);
      if (fails.length === 0) {
        results.push({
          ...base,
          status: 'pass',
          observation: `${instances.length} ${el.label.toLowerCase()} vérifié(s) — tous conformes.`,
        });
      } else {
        results.push({
          ...base,
          status: 'fail',
          observation: `${fails.length} sur ${instances.length} ${el.label.toLowerCase()} ne respectent pas le seuil (${checker.threshold}).`,
          nonCompliantElements: fails.map(r => ({
            id: r.inst.planRef ?? r.inst.id,
            detail: checker.failDetail(r.inst),
          })),
        });
      }
    });
  });

  return results;
}

// Mock vision detection results per element type
// planRef links each detected item to an actual door/window id in apartments.js
const VISION_MOCK = {
  doors: [
    { id: 'v_d1', label: 'Porte 1', width: '90 cm', planRef: 'dA101_1' },
    { id: 'v_d2', label: 'Porte 2', width: '78 cm', planRef: 'dA201_1' },
    { id: 'v_d3', label: 'Porte 3', width: '80 cm', planRef: 'dA201_2' },
    { id: 'v_d4', label: 'Porte 4', width: '90 cm', planRef: 'dA301_1' },
    { id: 'v_d5', label: 'Porte 5', width: '83 cm', planRef: 'dA102_1' },
    { id: 'v_d6', label: 'Porte 6', width: '80 cm', planRef: 'dA202_1' },
    { id: 'v_d7', label: 'Porte 7', width: '80 cm', planRef: 'dA302_1' },
  ],
  windows: [
    { id: 'v_w1', label: 'Fenêtre 1', width: '120 cm' },
    { id: 'v_w2', label: 'Fenêtre 2', width: '90 cm' },
    { id: 'v_w3', label: 'Fenêtre 3', width: '110 cm' },
  ],
};

function LeftSidebar() {
  return (
    <div className="flex flex-col items-center pt-3 pb-3 gap-4 flex-shrink-0 bg-white"
      style={{ width: 40, borderRight: '1px solid #f1f2f4' }}>
      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="5.5" r="2.5"/>
          <path d="M2.5 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/>
        </svg>
      </button>
      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <rect x="2" y="9" width="3" height="5" rx="0.5"/>
          <rect x="6.5" y="5" width="3" height="9" rx="0.5"/>
          <rect x="11" y="2" width="3" height="12" rx="0.5"/>
        </svg>
      </button>
    </div>
  );
}

// Sub-header banner shown after a document is loaded
function Banner({ selectedDocId }) {
  const doc = documents.find(d => d.id === selectedDocId);
  const totalDocs = documents.length;
  return (
    <div className="flex items-center justify-between px-5 flex-shrink-0 bg-white"
      style={{ height: 32, borderBottom: '1px solid #f1f2f4' }}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium" style={{ color: '#858586' }}>Documents</span>
        <span className="text-[10px] px-1 py-0.5 rounded" style={{ background: '#f1f2f4', color: '#636464' }}>
          {totalDocs}
        </span>
        {doc && (
          <span className="text-[10px] text-gray-400 ml-2 truncate max-w-xs">{doc.name}</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {[['AI Evaluations', '0'], ['Evaluations', '27']].map(([label, count]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-xs font-medium" style={{ color: '#858586' }}>{label}</span>
            <span className="text-[10px] px-1 py-0.5 rounded" style={{ background: '#f1f2f4', color: '#636464' }}>
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState(new Set([1]));

  const [selectedDocId, setSelectedDocId] = useState(null);
  const [docLoaded, setDocLoaded] = useState(false);
  const [scales, setScales] = useState({ 0: [100, null, null] });

  // Element scope state (step 1 panel)
  const [elements, setElements] = useState(defaultElementTypes);

  // Extraction state (step 2)
  // taskStates tracks vision element status: 'idle' | 'running' | 'review' | 'done'
  const [taskStates, setTaskStates] = useState(
    Object.fromEntries(extractionTasks.map(t => [t.id, 'idle']))
  );
  // visionResults: mock detected items per vision element
  const [visionResults, setVisionResults] = useState({}); // { [elementId]: [{id, label}] }

  // Smart select state (step 2)
  const [awaitingSmartSelect, setAwaitingSmartSelect] = useState(null); // { type:'metric'|'cell', elementId, metricId?, instanceId?, colId? }
  const [smartFilled, setSmartFilled] = useState({}); // { 'rooms.surface': true }
  const [cellValues, setCellValues] = useState({}); // { 'elementId.instanceId.colId': string }
  const [drawingMode, setDrawingMode] = useState(null); // { elementId } | null
  const [extraRows, setExtraRows] = useState({}); // { [elementId]: row[] }
  const [extraGroups, setExtraGroups] = useState([]); // [{ id, label, method, metrics }]

  // Hovered item in a vision review list → highlights it on the plan
  const [hoveredVisionItemId, setHoveredVisionItemId] = useState(null);

  // Method overrides: user can switch text ↔ vision per element
  const [methodOverrides, setMethodOverrides] = useState({}); // { [elementId]: 'text' | 'vision' }

  // Parent-child assignments for grouping panel
  const [parentAssignments, setParentAssignments] = useState({}); // { [elementId]: parentId | null }

  // Verification state (step 3)
  const [aiState, setAiState] = useState('idle'); // 'idle' | 'running' | 'done'
  const [evaluations, setEvaluations] = useState([]);
  const [ruleOverrides, setRuleOverrides] = useState({}); // { [evalId]: 'disregarded' }
  const [activeEvalId, setActiveEvalId] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [editedValues, setEditedValues] = useState({});
  const [activeApt, setActiveApt] = useState(null);
  const [zoomedApt, setZoomedApt] = useState(null);
  const [activeElementType, setActiveElementType] = useState(null); // which element type is focused

  // Panel sizing & detach
  const [panelWidth, setPanelWidth]       = useState(380);
  const [panelDetached, setPanelDetached] = useState(false);
  const resizeStartRef = useRef(null); // { x, width }

  const handleResizeStart = (e) => {
    e.preventDefault();
    resizeStartRef.current = { x: e.clientX, width: panelWidth };
    const onMove = (ev) => {
      const delta = resizeStartRef.current.x - ev.clientX; // drag left = wider
      setPanelWidth(Math.max(280, Math.min(640, resizeStartRef.current.width + delta)));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleLaunchAI = () => {
    setAiState('running');
    setTimeout(() => {
      setEvaluations(computeEvaluations(elements, taskStates, visionResults, methodOverrides));
      setRuleOverrides({});
      setAiState('done');
    }, 2200);
  };

  const handleDisregardEval = (evalId) =>
    setRuleOverrides(prev => ({ ...prev, [evalId]: 'disregarded' }));
  const handleReactivateEval = (evalId) =>
    setRuleOverrides(prev => { const n = { ...prev }; delete n[evalId]; return n; });

  const goToStep = (n) => {
    setVisitedSteps(prev => new Set([...prev, n]));
    setCurrentStep(n);
  };

  const handleSelectDoc = (docId) => {
    setSelectedDocId(docId);
    setDocLoaded(true);
  };

  // Element scope handlers
  const handleToggleScope = (elId) => {
    setElements(prev => prev.map(e => e.id === elId ? { ...e, inScope: !e.inScope } : e));
  };
  const handleToggleRule = (elId, ruleId) => {
    setElements(prev => prev.map(e => e.id !== elId ? e : {
      ...e,
      rules: e.rules.map(r => r.id === ruleId ? { ...r, active: !r.active } : r),
    }));
  };
  const handleToggleMetric = (elId, metricId) => {
    setElements(prev => prev.map(e => e.id !== elId ? e : {
      ...e,
      metrics: { ...e.metrics, [metricId]: !e.metrics[metricId] },
    }));
  };
  const handleToggleMethod = (elId, method) => {
    setElements(prev => prev.map(e => e.id !== elId ? e : { ...e, method }));
  };
  const handleAddCustomMetric = (elId, label) => {
    const id = `cm_${Date.now()}`;
    setElements(prev => prev.map(e => e.id !== elId ? e : {
      ...e,
      customMetrics: [...(e.customMetrics ?? []), { id, label }],
    }));
  };
  const handleSetMetricFilter = (elId, metricId, filter) => {
    setElements(prev => prev.map(e => e.id !== elId ? e : {
      ...e,
      metricFilters: filter
        ? { ...(e.metricFilters ?? {}), [metricId]: filter }
        : Object.fromEntries(Object.entries(e.metricFilters ?? {}).filter(([k]) => k !== metricId)),
    }));
  };

  const handleRemoveCustomMetric = (elId, metricId) => {
    setElements(prev => prev.map(e => e.id !== elId ? e : {
      ...e,
      customMetrics: (e.customMetrics ?? []).filter(m => m.id !== metricId),
    }));
    // Clear any smartFill for this metric
    setSmartFilled(prev => { const n = { ...prev }; delete n[`${elId}.${metricId}`]; return n; });
  };

  // Extraction handlers
  const handleLaunchTask = (taskId) => {
    if (taskStates[taskId] === 'running') return;
    setTaskStates(prev => ({ ...prev, [taskId]: 'running' }));
    setTimeout(() => {
      setTaskStates(prev => ({ ...prev, [taskId]: 'done' }));
    }, 1400 + Math.random() * 600);
  };

  // Vision detection for geometry-only elements (no text on plan)
  const handleLaunchVision = (elementId) => {
    // Map element id to task id for backward compat
    const taskMap = { doors: 'ext_portes', windows: 'ext_windows', stairs: 'ext_stairs' };
    const taskId = taskMap[elementId];
    if (taskId) setTaskStates(prev => ({ ...prev, [taskId]: 'running' }));
    setTaskStates(prev => ({ ...prev, [`vision_${elementId}`]: 'running' }));
    setTimeout(() => {
      setVisionResults(prev => ({ ...prev, [elementId]: VISION_MOCK[elementId] ?? [] }));
      setTaskStates(prev => ({ ...prev, [`vision_${elementId}`]: 'review' }));
      if (taskId) setTaskStates(prev => ({ ...prev, [taskId]: 'done' }));
    }, 1800 + Math.random() * 600);
  };
  const handleAcceptVision = (elementId) => {
    setTaskStates(prev => ({ ...prev, [`vision_${elementId}`]: 'done' }));
  };
  const handleDiscardVision = (elementId) => {
    setVisionResults(prev => { const n = { ...prev }; delete n[elementId]; return n; });
    setTaskStates(prev => ({ ...prev, [`vision_${elementId}`]: 'idle' }));
  };
  const handleVisionRemoveItem = (elementId, itemId) => {
    setVisionResults(prev => ({
      ...prev,
      [elementId]: (prev[elementId] ?? []).filter(item => item.id !== itemId),
    }));
  };
  const handleVisionAddItem = (elementId, item) => {
    setVisionResults(prev => ({
      ...prev,
      [elementId]: [...(prev[elementId] ?? []), item],
    }));
  };

  const handleAddElement = (elementId) => {
    setDrawingMode({ elementId });
  };

  const handleDrawingSave = (elementId, count) => {
    setExtraRows(prev => {
      const existing = prev[elementId] ?? [];
      const base = (EXTRACTION_RESULTS_COUNT[elementId] ?? 0) + existing.length;
      const newRows = Array.from({ length: count }, (_, i) => ({
        id: `${elementId}_extra_${Date.now()}_${i}`,
        label: `Élément ${base + i + 1}`,
      }));
      return { ...prev, [elementId]: [...existing, ...newRows] };
    });
    setDrawingMode(null);
  };

  const handleCancelDrawing = () => setDrawingMode(null);

  // Called from identification panel with full group config
  const handleAddGroup = (id, label, method, metrics, customMetrics) => {
    const groupId = id ?? `group_${Date.now()}`;
    setExtraGroups(prev => [...prev, { id: groupId, label, method: method ?? 'text', metrics: metrics ?? {}, customMetrics: customMetrics ?? [] }]);
  };

  // Called when user clicks an apartment polygon on the plan
  const handleAptClick = (aptId) => {
    const next = aptId === activeApt ? null : aptId;
    setActiveApt(next);
    setZoomedApt(null);
    setActiveElementType(next ? (APT_TO_ELEMENT[next] ?? null) : null);
  };

  // Called when user clicks a row in the extraction result table
  const handleInstanceClick = (instanceId) => {
    const inst = ALL_INSTANCES.find(i => i.id === instanceId);
    if (!inst?.planRef) return;
    const next = inst.planRef === activeApt ? null : inst.planRef;
    setActiveApt(next);
    setActiveElementType(next ? (APT_TO_ELEMENT[next] ?? null) : null);
  };

  // Called when user clicks an element type section in the extraction panel
  const handleElementTypeSelect = (elementId) => {
    const next = elementId === activeElementType ? null : elementId;
    setActiveElementType(next);
    setActiveApt(null); // clear specific apt when switching type focus
  };

  const handleTextLabelClick = () => {
    if (awaitingSmartSelect) {
      const { type, elementId, metricId, instanceId, colId } = awaitingSmartSelect;
      if (type === 'cell') {
        // Fill a specific custom-column cell from plan text
        setCellValues(prev => ({ ...prev, [`${elementId}.${instanceId}.${colId}`]: '—' }));
      } else {
        setSmartFilled(prev => ({ ...prev, [`${elementId}.${metricId}`]: true }));
      }
      setAwaitingSmartSelect(null);
      return;
    }
  };

  const handleSmartSelect = (elementId, metricId) => {
    if (!elementId) { setAwaitingSmartSelect(null); return; } // cancel
    setAwaitingSmartSelect({ type: 'metric', elementId, metricId });
  };

  const handleCellSelect = (elementId, instanceId, colId) => {
    setAwaitingSmartSelect({ type: 'cell', elementId, instanceId, colId });
  };

  const handleMethodChange = (elementId, method) => {
    setMethodOverrides(prev => ({ ...prev, [elementId]: method }));
    // Reset vision state when switching away from vision
    if (method === 'text') {
      setTaskStates(prev => ({ ...prev, [`vision_${elementId}`]: 'idle' }));
      setVisionResults(prev => { const n = { ...prev }; delete n[elementId]; return n; });
    }
  };

  const handleParentAssign = (elementId, parentId) => {
    setParentAssignments(prev => ({ ...prev, [elementId]: parentId || null }));
  };

  const handleExtract = () => {
    setTaskStates(Object.fromEntries(extractionTasks.map(t => [t.id, 'done'])));
    goToStep(2);
  };

  // Effective method respects user override
  const getMethod = (el) => methodOverrides[el.id] ?? el.method ?? 'text';

  // All in-scope elements must be identified:
  // — text method: every active metric filled via smart-select
  // — vision method: vision accepted (vision_${elementId} === 'done')
  const extractionDone = elements.filter(e => e.inScope).every(el => {
    const method = getMethod(el);
    if (method === 'text') {
      const preset = Object.entries(el.metrics).filter(([, v]) => v).map(([k]) => k);
      const custom = (el.customMetrics ?? []).map(m => m.id);
      const all = [...preset, ...custom];
      return all.length === 0 || all.every(m => smartFilled[`${el.id}.${m}`]);
    }
    return taskStates[`vision_${el.id}`] === 'done';
  });

  const planMode = currentStep === 1 ? 'raw'
    : currentStep === 2 ? 'extraction'
    : 'verification';

  const handleCta = () => {
    if (currentStep === 1 && docLoaded) goToStep(2);
    else if (currentStep === 2 && extractionDone) goToStep(3);
  };

  const ctaLabel =
    currentStep === 1 ? null :
    currentStep === 2 ? (extractionDone ? 'Vérification →' : null) :
    'Exporter →';

  const showDocSelector = currentStep === 1 && !docLoaded;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top bar — only show on steps 2+ */}
      {currentStep > 1 && (
        <>
          <Topbar ctaLabel={ctaLabel} onCta={handleCta} />
          <Stepbar
            currentStep={currentStep}
            visitedSteps={visitedSteps}
            onStepClick={goToStep}
            selectedPlanName={null}
          />
        </>
      )}

      {/* Project header — always visible */}
      {currentStep === 1 && (
        <div className="flex items-center px-5 flex-shrink-0 bg-white"
          style={{ height: 41, borderBottom: '1px solid #f1f2f4' }}>
          <span className="text-sm font-semibold text-gray-900">Résidence Les Acacias — APD</span>
        </div>
      )}

      {/* Document banner — visible when doc loaded */}
      {docLoaded && currentStep === 1 && <Banner selectedDocId={selectedDocId} />}

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', position: 'relative' }}>
        <LeftSidebar />

        {showDocSelector ? (
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <DocSelector selectedId={selectedDocId} onSelect={handleSelectDoc} />
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
              <PlanShell
                docLoaded={docLoaded}
                onSelectDoc={handleSelectDoc}
                selectedPlan={0}
                scales={scales}
                onScaleChange={(idx, s) => setScales(prev => ({ ...prev, [idx]: s }))}
                mode={planMode}
                extractionDone={extractionDone}
                activeApt={activeApt}
                onAptClick={handleAptClick}
                activeElementType={activeElementType}
                visionDoorItems={
                  (taskStates['vision_doors'] === 'review' || taskStates['vision_doors'] === 'done')
                    ? (visionResults['doors'] ?? []).filter(i => i.planRef)
                    : []
                }
                hoveredVisionItemId={hoveredVisionItemId}
                overrides={overrides}
                editedValues={editedValues}
                zoomedApt={zoomedApt}
                textSelectMode={!!awaitingSmartSelect}
                activeSmartSelect={awaitingSmartSelect}
                onTextLabelClick={handleTextLabelClick}
                aiState={aiState}
                activeEvalId={activeEvalId}
                drawingMode={drawingMode}
                onDrawingSave={handleDrawingSave}
                onCancelDrawing={handleCancelDrawing}
              />
            </div>

            {/* ── Right panel (resizable + detachable) ─────────────────── */}
            {panelDetached ? (
              <>
                {/* Slim placeholder strip when panel is floating */}
                <div style={{
                  width: 42, flexShrink: 0, borderLeft: '1px solid #f1f2f4',
                  background: 'white', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', paddingTop: 10, gap: 6,
                }}>
                  <button
                    onClick={() => setPanelDetached(false)}
                    title="Réattacher le panneau"
                    style={{
                      width: 28, height: 28, borderRadius: 8, border: '1px solid #e5e7eb',
                      background: 'white', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#9ca3af',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#5151cd'; e.currentTarget.style.color = '#5151cd'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af'; }}
                  >
                    {/* Dock-back icon */}
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="1" width="12" height="12" rx="2"/>
                      <path d="M9 1v12"/>
                      <path d="M6 5l-2 2 2 2"/>
                    </svg>
                  </button>
                  {/* Step dots */}
                  {[1,2,3].map(s => (
                    <div key={s} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: s === currentStep ? '#5151cd' : '#e5e7eb',
                    }} />
                  ))}
                </div>

                {/* Portal: full panel content in new window */}
                <PopoutPanel
                  title={`Plan Analyse — ${currentStep === 1 ? 'Périmètre' : currentStep === 2 ? 'Identification' : 'Vérification'}`}
                  onClose={() => setPanelDetached(false)}
                >
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'white' }}>
                    {/* Popout toolbar */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0 10px 0 14px', height: 36, flexShrink: 0,
                      borderBottom: '1px solid #f1f2f4', background: '#fafafa',
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.02em' }}>
                        {currentStep === 1 ? 'Périmètre' : currentStep === 2 ? 'Identification' : 'Vérification'}
                      </span>
                      <button
                        onClick={() => setPanelDetached(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          fontSize: 11, color: '#6b7280', fontWeight: 500,
                          background: 'none', border: '1px solid #e5e7eb',
                          borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                          transition: 'all .12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#5151cd'; e.currentTarget.style.color = '#5151cd'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}
                      >
                        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="1" width="12" height="12" rx="2"/><path d="M9 1v12"/><path d="M6 5l-2 2 2 2"/>
                        </svg>
                        Réattacher
                      </button>
                    </div>
                    {/* Panel content */}
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      {currentStep === 1 && (
                        <ElementScopePanel
                          elements={elements}
                          onToggleScope={handleToggleScope}
                          onToggleRule={handleToggleRule}
                          onToggleMetric={handleToggleMetric}
                          onToggleMethod={handleToggleMethod}
                          onAddCustomMetric={handleAddCustomMetric}
                          onRemoveCustomMetric={handleRemoveCustomMetric}
                          onSetMetricFilter={handleSetMetricFilter}
                          onExtract={handleExtract}
                        />
                      )}
                      {currentStep === 2 && (
                        <ExtractionPanel
                          elements={elements}
                          smartFilled={smartFilled}
                          onSmartSelect={handleSmartSelect}
                          awaitingSmartSelect={awaitingSmartSelect}
                          visionStates={taskStates}
                          visionResults={visionResults}
                          onLaunchVision={handleLaunchVision}
                          onAcceptVision={handleAcceptVision}
                          onDiscardVision={handleDiscardVision}
                          onVisionRemoveItem={handleVisionRemoveItem}
                          onVisionAddItem={handleVisionAddItem}
                          methodOverrides={methodOverrides}
                          onMethodChange={handleMethodChange}
                          extraRows={extraRows}
                          onAddElement={handleAddElement}
                          activeApt={activeApt}
                          onInstanceClick={handleInstanceClick}
                          extraGroups={extraGroups}
                          onAddGroup={handleAddGroup}
                          cellValues={cellValues}
                          onCellSelect={handleCellSelect}
                          parentAssignments={parentAssignments}
                          onParentAssign={handleParentAssign}
                          extractionDone={extractionDone}
                          activeElementType={activeElementType}
                          onElementTypeSelect={handleElementTypeSelect}
                          onVisionItemHover={setHoveredVisionItemId}
                        />
                      )}
                      {currentStep === 3 && (
                        <VerificationPanel
                          aiState={aiState}
                          onLaunchAI={handleLaunchAI}
                          evaluations={evaluations}
                          ruleOverrides={ruleOverrides}
                          onDisregard={handleDisregardEval}
                          onReactivate={handleReactivateEval}
                          activeEvalId={activeEvalId}
                          onSetActiveEvalId={setActiveEvalId}
                          activeApt={activeApt}
                          onElementClick={(aptId) => { setActiveApt(aptId); setZoomedApt(null); }}
                        />
                      )}
                    </div>
                  </div>
                </PopoutPanel>
              </>
            ) : (
              <div
                className="flex flex-col overflow-hidden flex-shrink-0"
                style={{ width: panelWidth, position: 'relative' }}
              >
                {/* Resize handle — left edge */}
                <div
                  onMouseDown={handleResizeStart}
                  style={{
                    position: 'absolute', top: 0, left: -3, bottom: 0, width: 7,
                    cursor: 'col-resize', zIndex: 20,
                  }}
                />

                {/* Control strip */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  padding: '0 8px', height: 26, flexShrink: 0,
                  borderBottom: '1px solid #f1f2f4', borderLeft: '1px solid #f1f2f4',
                  background: 'white',
                }}>
                  <button
                    onClick={() => setPanelDetached(true)}
                    title="Ouvrir dans une nouvelle fenêtre"
                    style={{
                      width: 22, height: 22, borderRadius: 6, border: '1px solid transparent',
                      background: 'none', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#c4c6cc',
                      transition: 'all .12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#5151cd'; e.currentTarget.style.background = 'rgba(81,81,205,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#c4c6cc'; e.currentTarget.style.background = 'none'; }}
                  >
                    {/* External window icon */}
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="9" height="9" rx="1.5"/>
                      <path d="M6 1h7v7"/>
                      <path d="M14 1L8 7"/>
                    </svg>
                  </button>
                </div>

                {currentStep === 1 && (
                  <ElementScopePanel
                    elements={elements}
                    onToggleScope={handleToggleScope}
                    onToggleRule={handleToggleRule}
                    onToggleMetric={handleToggleMetric}
                    onToggleMethod={handleToggleMethod}
                    onAddCustomMetric={handleAddCustomMetric}
                    onRemoveCustomMetric={handleRemoveCustomMetric}
                    onSetMetricFilter={handleSetMetricFilter}
                    onExtract={handleExtract}
                  />
                )}
                {currentStep === 2 && (
                  <ExtractionPanel
                    elements={elements}
                    smartFilled={smartFilled}
                    onSmartSelect={handleSmartSelect}
                    awaitingSmartSelect={awaitingSmartSelect}
                    visionStates={taskStates}
                    visionResults={visionResults}
                    onLaunchVision={handleLaunchVision}
                    onAcceptVision={handleAcceptVision}
                    onDiscardVision={handleDiscardVision}
                    onVisionRemoveItem={handleVisionRemoveItem}
                    onVisionAddItem={handleVisionAddItem}
                    methodOverrides={methodOverrides}
                    onMethodChange={handleMethodChange}
                    extraRows={extraRows}
                    onAddElement={handleAddElement}
                    activeApt={activeApt}
                    onInstanceClick={handleInstanceClick}
                    extraGroups={extraGroups}
                    onAddGroup={handleAddGroup}
                    cellValues={cellValues}
                    onCellSelect={handleCellSelect}
                    parentAssignments={parentAssignments}
                    onParentAssign={handleParentAssign}
                    extractionDone={extractionDone}
                    activeElementType={activeElementType}
                    onElementTypeSelect={handleElementTypeSelect}
                  />
                )}
                {currentStep === 3 && (
                  <VerificationPanel
                    aiState={aiState}
                    onLaunchAI={handleLaunchAI}
                    evaluations={evaluations}
                    ruleOverrides={ruleOverrides}
                    onDisregard={handleDisregardEval}
                    onReactivate={handleReactivateEval}
                    activeEvalId={activeEvalId}
                    onSetActiveEvalId={setActiveEvalId}
                    activeApt={activeApt}
                    onElementClick={(aptId) => { setActiveApt(aptId); setZoomedApt(null); }}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>

      <RuleInFocusPopover />
    </div>
  );
}

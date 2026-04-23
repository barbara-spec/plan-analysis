import PlanCanvas from './PlanCanvas';
import ScaleOverlay from '../detection/ScaleOverlay';

const MODE_CONFIG = {
  raw:          { label: 'Plan brut',    dot: '#9ca3af' },
  extraction:   { label: 'Extraction',   dot: '#6366f1' },
  verification: { label: 'Vérification', dot: '#22c55e' },
};

export default function PlanShell({
  docLoaded, onSelectDoc,
  selectedPlan, scales, onScaleChange,
  mode, extractionDone, elements,
  activeApt, onAptClick,
  activeElementType,
  visionDoorItems,
  hoveredVisionItemId,
  overrides, editedValues,
  zoomedApt,
  textSelectMode,
  onTextLabelClick,
  aiState,
  activeEvalId,
  drawingMode,
  onDrawingSave,
  onCancelDrawing,
}) {
  const mc = MODE_CONFIG[mode] ?? MODE_CONFIG.raw;

  return (
    <div className="relative flex-1 overflow-hidden bg-gray-100 flex flex-col">
      {/* Scale control */}
      <ScaleOverlay
        selectedPlan={selectedPlan}
        scales={scales}
        onChange={onScaleChange}
      />

      {/* Mode badge */}
      <div
        className="absolute top-3 left-3 z-10 flex items-center gap-1.5 select-none"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 20,
          padding: '4px 10px 4px 8px',
          boxShadow: '0 1px 4px rgba(0,0,0,.08)',
          fontSize: 11,
          fontWeight: 500,
          color: '#374151',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: mc.dot }} />
        {mc.label}
      </div>

      {/* Plan */}
      <div className="flex-1">
        <PlanCanvas
          mode={mode}
          extractionDone={extractionDone}
          elements={elements}
          activeApt={activeApt}
          onAptClick={onAptClick}
          activeElementType={activeElementType}
          visionDoorItems={visionDoorItems}
          hoveredVisionItemId={hoveredVisionItemId}
          overrides={overrides}
          editedValues={editedValues}
          zoomedApt={zoomedApt}
          textSelectMode={textSelectMode}
          onTextLabelClick={onTextLabelClick}
          aiState={aiState}
          activeEvalId={activeEvalId}
          drawingMode={drawingMode}
          onDrawingSave={onDrawingSave}
          onCancelDrawing={onCancelDrawing}
        />
      </div>

      {/* Page navigator */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center"
        style={{
          background: 'rgba(17,24,39,0.82)',
          backdropFilter: 'blur(4px)',
          borderRadius: 20,
          padding: '5px 4px',
          gap: 0,
        }}
      >
        <button className="w-7 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded-full text-sm">←</button>
        <span className="text-white text-[11px] px-2 select-none" style={{ opacity: 0.7 }}>Page 1 / 3</span>
        <button className="w-7 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded-full text-sm">→</button>
      </div>

      {/* Zoom controls */}
      <div
        className="absolute bottom-4 right-4 flex items-center"
        style={{
          background: 'rgba(17,24,39,0.82)',
          backdropFilter: 'blur(4px)',
          borderRadius: 20,
          padding: '5px 6px',
          gap: 2,
        }}
      >
        {['+', '−', '⊡'].map((ch, i) => (
          <button
            key={i}
            className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded-full text-sm"
          >{ch}</button>
        ))}
      </div>
    </div>
  );
}

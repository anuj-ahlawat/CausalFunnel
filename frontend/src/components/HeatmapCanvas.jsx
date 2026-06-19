import { useEffect, useMemo, useRef, useState } from 'react';
import { canEmbedPreview, debugLog, stripUrlHash } from '../utils/heatmap';

function HeatmapMarker({ normalizedX, normalizedY, pageX, pageY }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${normalizedX * 100}%`,
        top: `${normalizedY * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
      title={`page (${pageX}, ${pageY}) · norm (${normalizedX.toFixed(3)}, ${normalizedY.toFixed(3)})`}
    >
      <div
        className="h-10 w-10 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(239,68,68,0.85) 0%, rgba(239,68,68,0.45) 40%, rgba(239,68,68,0.12) 70%, transparent 100%)',
          boxShadow: '0 0 20px rgba(239,68,68,0.35)',
        }}
      />
    </div>
  );
}

export default function HeatmapCanvas({
  clicks,
  pageUrl,
  pageWidth,
  pageHeight,
  viewportWidth,
}) {
  const viewportRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const previewUrl = useMemo(() => stripUrlHash(pageUrl), [pageUrl]);
  const layoutWidth = viewportWidth || pageWidth;

  const markers = useMemo(() => {
    const list = clicks.map((click, index) => ({
      id: `${click.pageX ?? click.clickX}-${click.pageY ?? click.clickY}-${index}`,
      pageX: click.pageX ?? click.clickX,
      pageY: click.pageY ?? click.clickY,
      normalizedX: click.normalizedX,
      normalizedY: click.normalizedY,
    }));

    debugLog('frontend:heatmap-markers', {
      pageWidth,
      pageHeight,
      layoutWidth,
      markers: list,
    });

    return list;
  }, [clicks, pageWidth, pageHeight, layoutWidth]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });

    observer.observe(element);
    setContainerWidth(element.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const scale = containerWidth > 0 && pageWidth > 0 ? containerWidth / pageWidth : 1;
  const scaledHeight = pageHeight * scale;
  const embedPreview = canEmbedPreview(previewUrl);

  if (!clicks.length) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-500">No click data yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-5 py-3 text-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Click heatmap</p>
          <p className="mt-0.5 text-sm">{clicks.length} clicks</p>
        </div>
        <div className="text-right text-xs text-slate-300">
          <p>Document: {pageWidth}×{pageHeight}px</p>
          <p>Layout width: {layoutWidth}px · scale {Math.round(scale * 100)}%</p>
        </div>
      </div>

      <div ref={viewportRef} className="max-h-[min(75vh,900px)] overflow-auto bg-slate-100">
        <div
          className="relative mx-auto"
          style={{ width: containerWidth || '100%', height: scaledHeight }}
        >
          <div
            className="relative origin-top-left bg-white"
            style={{
              width: pageWidth,
              height: pageHeight,
              transform: `scale(${scale})`,
            }}
          >
            {embedPreview ? (
              <iframe
                title="Page preview"
                src={previewUrl}
                width={layoutWidth}
                height={pageHeight}
                className="pointer-events-none absolute left-0 top-0 block border-0"
                style={{ opacity: 0.98 }}
              />
            ) : (
              <div className="absolute inset-0 bg-slate-50" />
            )}

            {markers.map((marker) => (
              <HeatmapMarker
                key={marker.id}
                normalizedX={marker.normalizedX}
                normalizedY={marker.normalizedY}
                pageX={marker.pageX}
                pageY={marker.pageY}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

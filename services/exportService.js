/**
 * DraftDeckAI - Export Service
 * Fixes incorrect layer ordering during PNG/SVG export by sorting elements by zIndex.
 */

/**
 * Sort layers by zIndex before export to preserve correct layer order.
 * @param {Array} layers - Array of layer/element objects with a zIndex property
 * @returns {Array} Sorted array with lowest zIndex first (background to foreground)
 */
export function sortLayersByZIndex(layers) {
  return [...layers].sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Export canvas to PNG with correct layer ordering.
 * @param {fabric.Canvas} canvas - Fabric.js canvas instance
 * @param {Array} elements - Array of Element objects with zIndex
 * @returns {string} PNG data URL
 */
export function exportToPNG(canvas, elements) {
  if (!canvas) throw new Error('Canvas is required for export');

  const sortedElements = sortLayersByZIndex(elements ?? []);

  // Re-apply z-order on canvas objects before export
  sortedElements.forEach((element, index) => {
    if (element.object) {
      canvas.moveTo(element.object, index);
    }
  });

  canvas.renderAll();

  return canvas.toDataURL({ format: 'png', quality: 1.0 });
}

/**
 * Export canvas to SVG with correct layer ordering.
 * @param {fabric.Canvas} canvas - Fabric.js canvas instance
 * @param {Array} elements - Array of Element objects with zIndex
 * @returns {string} SVG string
 */
export function exportToSVG(canvas, elements) {
  if (!canvas) throw new Error('Canvas is required for export');

  const sortedElements = sortLayersByZIndex(elements ?? []);

  // Re-apply z-order on canvas objects before export
  sortedElements.forEach((element, index) => {
    if (element.object) {
      canvas.moveTo(element.object, index);
    }
  });

  canvas.renderAll();

  return canvas.toSVG();
}

/**
 * Trigger a file download for the exported PNG.
 * @param {string} dataUrl - PNG data URL
 * @param {string} filename - Output filename
 */
export function downloadPNG(dataUrl, filename = 'design.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Trigger a file download for the exported SVG.
 * @param {string} svgString - SVG content string
 * @param {string} filename - Output filename
 */
export function downloadSVG(svgString, filename = 'design.svg') {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
document.body.removeChild(link);
setTimeout(() => URL.revokeObjectURL(url), 0);
}

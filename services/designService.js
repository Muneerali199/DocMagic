/**
 * DraftDeckAI - Design Service
 * Fixes N+1 query problem when loading layer properties for large canvases.
 */

export async function batchFetchLayerProperties(layers, LayerProperty) {
  if (!layers || layers.length === 0) return new Map();

  const layerIds = layers.map((l) => l.id);

  const properties = await LayerProperty.find({ layerId: { $in: layerIds } });

  const propertiesMap = new Map();
  for (const prop of properties) {
    propertiesMap.set(String(prop.layerId), prop);
  }

  return propertiesMap;
}

export async function loadDesignWithLayers(designId, DesignModel, LayerProperty) {
  const design = await DesignModel.findById(designId);
  if (!design) throw new Error(`Design not found: ${designId}`);

  const layers = design.layers || [];
  if (layers.length === 0) return { ...design.toObject(), layers: [] };

  const propertiesMap = await batchFetchLayerProperties(layers, LayerProperty);

  const layersWithProperties = layers.map((layer) => ({
    ...layer,
    properties: propertiesMap.get(String(layer.id)) || null,
  }));

  return {
    ...design.toObject(),
    layers: layersWithProperties,
  };
}
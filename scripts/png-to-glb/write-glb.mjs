import { Document } from '@gltf-transform/core';

function addPrimitive(doc, buffer, { positions, normals, uvs, indices, material }) {
  const posAcc = doc
    .createAccessor()
    .setType('VEC3')
    .setArray(new Float32Array(positions))
    .setBuffer(buffer);

  const normAcc = doc
    .createAccessor()
    .setType('VEC3')
    .setArray(new Float32Array(normals))
    .setBuffer(buffer);

  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', posAcc)
    .setAttribute('NORMAL', normAcc)
    .setMaterial(material);

  if (uvs.length > 0) {
    const uvAcc = doc
      .createAccessor()
      .setType('VEC2')
      .setArray(new Float32Array(uvs))
      .setBuffer(buffer);
    prim.setAttribute('TEXCOORD_0', uvAcc);
  }

  if (indices.length > 0) {
    const idxAcc = doc
      .createAccessor()
      .setType('SCALAR')
      .setArray(new Uint32Array(indices))
      .setBuffer(buffer);
    prim.setIndices(idxAcc);
  }

  return prim;
}

function geometryToArrays(geo) {
  geo.computeVertexNormals();
  const pos = geo.getAttribute('position');
  const norm = geo.getAttribute('normal');
  const uv = geo.getAttribute('uv');
  const idx = geo.index;
  return {
    positions: Array.from(pos.array),
    normals: Array.from(norm.array),
    uvs: uv ? Array.from(uv.array) : [],
    indices: idx ? Array.from(idx.array) : [],
  };
}

/**
 * @param {import('three').BufferGeometry} shellGeo
 * @param {import('three').BufferGeometry} frontGeo
 * @param {Buffer} pngBuffer
 */
export function buildGlbDocument(shellGeo, frontGeo, pngBuffer) {
  const doc = new Document();
  const buffer = doc.createBuffer();

  const shellMat = doc
    .createMaterial('shell')
    .setBaseColorFactor([0.18, 0.18, 0.22, 1])
    .setMetallicFactor(0.15)
    .setRoughnessFactor(0.72);

  const tex = doc.createTexture('unit').setMimeType('image/png').setImage(pngBuffer);
  const frontMat = doc
    .createMaterial('front')
    .setBaseColorTexture(tex)
    .setAlphaMode('MASK')
    .setAlphaCutoff(0.42)
    .setDoubleSided(false)
    .setMetallicFactor(0.06)
    .setRoughnessFactor(0.48);

  const mesh = doc.createMesh('unit');
  mesh.addPrimitive(addPrimitive(doc, buffer, { ...geometryToArrays(shellGeo), material: shellMat }));
  mesh.addPrimitive(addPrimitive(doc, buffer, { ...geometryToArrays(frontGeo), material: frontMat }));

  doc.createScene('Scene').addChild(doc.createNode('unit').setMesh(mesh));
  return doc;
}

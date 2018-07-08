import {Box3, Vector3} from 'three';
import {BufferGeometryUtils} from './BufferGeometryUtils'


const box = new Box3();

function getSize(object) {
  box.setFromObject(object);
  return box.getSize();
}

function getCenter(object) {
  box.setFromObject(object);
  return box.getCenter(new Vector3());
}

export default {
  BufferGeometryUtils,
  getSize, getCenter
}

export {
  BufferGeometryUtils,
  getSize, getCenter
}

<template>
  <section>
    <GithubCorner></GithubCorner>
    <main role="main" class="container">
      <div class="mt-5 text-center">
        <h2>Vue.JS 3D Model Viewer Example</h2>
      </div>
      <div class="row">
        <div class="col-md-2">
          <button type="button" class="btn btn-primary btn-block" @click="changeModel('gltf')">GLTF</button>
          <button type="button" class="btn btn-primary btn-block" @click="changeModel('glb')">GLTF (GLB)</button>
          <button type="button" class="btn btn-primary btn-block" @click="changeModel('gltf_anim')">GLTF (Anim)</button>
        </div>
        <div class="col-md-10">
          <ModelViewer
            :lights="lights"
            :background-color="backgroundColor"
            :show-controls="true"
            :visible-controls="visibleControls"
            :src="src"
            :cubemap="cubemap"
            :statsjs="statsjs"
            :datgui="datgui"
            :rotation="rotate"
            :playAnimation="anim"
          ></ModelViewer>
        </div>
      </div>
    </main>
  </section>
</template>
<script>
  import {Vector3, Euler} from 'three';

  import GithubCorner from './components/GithubCorner.vue';

  import ModelViewer from '../src/components/ModelViewer.vue' //develop
  //import {ModelViewer} from '../dist/vue-3dmodel-viewer.esm' //webpack test
  //import { ModelViewer } from './../'; // for test

  export default {
    name: 'app',
    components: {
      ModelViewer,
      GithubCorner
    },
    data() {
      return {
        models: {
          'gltf': {
            src: 'models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
            rotate: new Euler()
          },
          'gltf_anim': {
            src: 'models/gltf/CesiumMan/glTF/CesiumMan.gltf',
            rotate: new Euler(0, 0, 0),
            anim: true
          },
          'glb': {
            src: 'models/gltf/BoomBox/glTF-Binary/BoomBox.glb',
            rotate: new Euler(0, Math.PI, 0)
          }
        },
        lights: [
          {
            type: 'hemisphere',
            skyColor: 0xbbbbff,
            groundColor: 0x444422,
            position: new Vector3(0, 1, 0)
          }/*,
          {
            type: 'AmbientLight',
            color: 0xaaaaaa
          },
          {
            type: 'DirectionalLight',
            position: { x: 1, y: 1, z: 1 },
            color: 0xffffff,
            intensity: 0.8
          }
          ,{
            type: 'ambient',
            color: 0x1e1e23
          },
          {
            type: 'directional',
            color: 0xcfcfcf,
            position: new Vector3(20, 40, -15)
          }*/
        ],
        src: null,
        backgroundColor: 0xffffff,
        visibleControls: {help: true, fullscreen: true, download: true},
        statsjs: true,
        datgui: true,
        cubemap: [
          'textures/cube/Bridge2/posx.jpg',
          'textures/cube/Bridge2/negx.jpg',
          'textures/cube/Bridge2/posy.jpg',
          'textures/cube/Bridge2/negy.jpg',
          'textures/cube/Bridge2/posz.jpg',
          'textures/cube/Bridge2/negz.jpg',
        ],
        rotate: new Vector3(),
        anim: true
      }
    },
    mounted() {
      this.src = this.models.gltf.src;
    },
    methods: {
      changeModel(el) {
        this.src = this.models[el].src;
        this.rotate = this.models[el].rotate;
        this.anim = this.models[el].anim || true;
      }
    }
  }
</script>

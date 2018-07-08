<template>
  <div id="app">
    <GithubCorner></GithubCorner>
    <section class="section">
      <div class="container">
        <h1 class="title">
          Vue.JS 3D Model Viewer Example
        </h1>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <ModelViewer
          :lights="lights"
          :background-color="backgroundColor"
          :show-controls="true"
          :visible-controls="visibleControls"
          :src="'models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf'"
          :cubemap="cubemap"
        ></ModelViewer>
      </div>
    </section>
  </div>
</template>

<script>
  import {Vector3} from 'three';

  import GithubCorner from './components/GithubCorner.vue';

  import ModelViewer from '../src/components/ModelViewer.vue'

  export default {
    name: 'app',
    components: {
      ModelViewer,
      GithubCorner
    },
    data() {
      return {
        lights: [
          {
            type: 'hemisphere',
            skyColor: 0xbbbbff,
            groundColor: 0x444422,
            position: new Vector3(0,1,0)
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
          }*/
          ,{
            type: 'ambient',
            color: 0x1e1e23
          },
          {
            type: 'directional',
            color: 0xcfcfcf,
            position: new Vector3(20, 40, -15)
          }
        ],
        backgroundColor: 0x444444,
        visibleControls: {help: true, fullscreen: true, download: true},
        cubemap: [
          'textures/cube/Bridge2/posx.jpg',
          'textures/cube/Bridge2/negx.jpg',
          'textures/cube/Bridge2/posy.jpg',
          'textures/cube/Bridge2/negy.jpg',
          'textures/cube/Bridge2/posz.jpg',
          'textures/cube/Bridge2/negz.jpg',
        ],
      }
    }
  }
</script>

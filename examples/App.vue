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
        <ModelViewer :lights="lights" :background-color="backgroundColor" :show-controls="true"
                     :visible-controls="visibleControls"></ModelViewer>
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
        visibleControls: {help: true, fullscreen: true, download: true}
      }
    }
  }
</script>

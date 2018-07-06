<template>
  <div id="app">
    <ModelViewer></ModelViewer>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import ModelViewer from './components/ModelViewer.vue'

export default {
  name: 'app',
  components: {
    HelloWorld, ModelViewer
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

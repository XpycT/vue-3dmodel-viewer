<script>
  import {
    Clock,
    Color,
    RGBFormat,
    Vector3,
    Object3D,
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    AmbientLight,
    PointLight,
    DirectionalLight,
    HemisphereLight,
    CubeTextureLoader,
  } from 'three'

  import {OrbitControls} from '../controls/OrbitControls'

  import {getCenter, getSize} from '../utils'

  import ScreenFull from 'screenfull-es6'

  import Stats from 'stats.js'
  import * as dat from 'dat.gui'

  const suportWebGL = (() => {
    try {
      let canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  })();

  export default {
    props: {
      src: {
        type: String
      },
      position: {
        type: Object,
        default() {
          return {x: 0, y: 0, z: 0}
        }
      },
      rotation: {
        type: Object,
        default() {
          return {x: 0, y: 0, z: 0}
        }
      },
      scale: {
        type: Object,
        default() {
          return {x: 1, y: 1, z: 1}
        }
      },
      animationTime: {
        type: Number,
        default: 0
      },
      playAnimation: {
        type: Boolean,
        default: true
      },
      lights: {
        type: Array,
        default() {
          return [
            {
              type: 'ambient',
              color: 0x1e1e23
            },
            {
              type: 'directional',
              color: 0xcfcfcf,
              position: new Vector3(20, 40, -15)
            }
          ];
        }
      },
      backgroundColor: {
        default: 0x444444
      },
      backgroundAlpha: {
        type: Number,
        default: 1
      },
      cameraPosition: {
        type: Object
      },
      cameraRotation: {
        type: Object
      },
      cameraUp: {
        type: Object
      },
      cameraLookAt: {
        type: Object
      },
      showControls: {
        type: Boolean,
        default: true
      },
      visibleControls: {
        type: Object,
        default() {
          return {
            help: true,
            download: true,
            fullscreen: true
          }
        }
      },
      controllable: {
        type: Boolean,
        default: true
      },
      cubemap: {
        type: Array,
        default() {
          return []
        }
      },
      statsjs: {
        type: Boolean,
        default: false
      },
      datgui: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        suportWebGL,
        fullscreen: false,
        showHelp: false,
        size: {
          width: this.width,
          height: this.height
        },
        initSize: {
          width: 0,
          height: 0
        },
        object: null,
        wrapper: new Object3D(),
        camera: new PerspectiveCamera(45, 1, 0.01, 100000),
        scene: new Scene(),
        renderer: null,
        controls: null,
        allLights: [],
        envMap: null,
        loader: null,
        mixer: null,
        reqId: null,    // requestAnimationFrame id
        clock: new Clock(),
        stats: null,
        gui: null
      }
    },
    mounted() {
      if (this.width === undefined || this.height === undefined) {
        this.size = {
          width: this.$el.offsetWidth,
          height: this.$el.offsetHeight
        }
      }
      this.initSize = this.size;

      this.renderer = new WebGLRenderer({antialias: true, alpha: true, canvas: this.$refs.canvas});
      this.renderer.shadowMap.enabled = false;
      this.renderer.gammaOutput = false;
      //this.renderer.physicallyCorrectLights = true;

      this.scene.background = new Color(this.backgroundColor).getHex();
      this.scene.add(this.wrapper);

      this.load();
      this.update();

      window.addEventListener('keydown', this.onKeydown, false);
      window.addEventListener('resize', this.onResize, false);

      this.animate();
    },
    beforeDestroy() {
      cancelAnimationFrame(this.reqId);

      window.removeEventListener('keydown', this.onKeydown, false);
      window.removeEventListener('resize', this.onResize, false);
    },
    watch: {
      src() {
        this.load();
      },
      rotation: {
        deep: true,
        handler(val) {
          if (!this.object) return;
          this.object.rotation.set(val.x, val.y, val.z);
        }
      },
      position: {
        deep: true,
        handler(val) {
          if (!this.object) return;
          this.object.position.set(val.x, val.y, val.z);
        }
      },
      scale: {
        deep: true,
        handler(val) {
          if (!this.object) return;
          this.object.scale.set(val.x, val.y, val.z);
        }
      },
      lights: {
        deep: true,
        handler() {
          this.updateLights();
        }
      },
      cubemap: {
        deep: true,
        handler() {
          this.updateCubemaps();
        }
      },
      size: {
        deep: true,
        handler() {
          this.updateCamera();
          this.updateRenderer();
        }
      },
      controllable() {
        this.updateControls();
      },
      backgroundAlpha() {
        this.updateRenderer();
      },
      backgroundColor() {
        this.updateRenderer();
      },
      statsjs() {
        this.updateStats();
      },
      datgui() {
        this.updateDatGui();
      }
    },
    computed: {},
    methods: {
      onKeydown(event) {
        console.log(event.which);
        if (event.which === 32) { // space
          this.resetCameraView();
        }
      },
      onResize() {
        if (this.width === undefined || this.height === undefined) {
          this.$nextTick(() => {
            this.size = {
              width: this.$el.offsetWidth,
              height: this.$el.offsetHeight
            }
          })
        }
      },
      update() {
        this.updateRenderer();
        this.updateCubemaps();
        this.updateCamera();
        this.updateLights();
        this.updateControls();
        this.updateStats();
        this.updateDatGui();
      },
      updateStats() {
        if (!this.statsjs) {
          if (document.getElementById('stats-panel')) document.getElementById('stats-panel').remove();

          return;
        }

        this.stats = new Stats();
        this.stats.dom.id = 'stats-panel';
        this.stats.dom.style.position = 'absolute';
        this.stats.visible = true;
        this.$el.appendChild(this.stats.dom);
      },
      updateDatGui() {

        if (!this.datgui) return;

        if (this.gui !== null) this.gui.destroy();

        this.gui = new dat.GUI({autoPlace: false});
        this.gui.closed = true;
        this.$refs.datgui.appendChild(this.gui.domElement);

        let parameters =
          {
            model: {
              scale: {x: 1, y: 1, z: 1},
              position: {x: 0, y: 0, z: 0},
              rotation: {x: 0, y: 0, z: 0},
              wireframe: false
            }
          };

        let de2ra = function (degree) {
          return degree * (Math.PI / 180);
        };

        let _folder1 = this.gui.addFolder('Model');
        _folder1.add(parameters.model.scale, 'x', 0.1, 5).name('scaleX').onChange(value => this.object.scale.x = value);
        _folder1.add(parameters.model.scale, 'y', 0.1, 5).name('scaleY').onChange(value => this.object.scale.y = value);
        _folder1.add(parameters.model.scale, 'z', 0.1, 5).name('scaleZ').onChange(value => this.object.scale.z = value);

        _folder1.add(parameters.model.position, 'x', -150, 150).name('positionX').onChange(value => this.object.position.x = de2ra(value));
        _folder1.add(parameters.model.position, 'y', -150, 150).name('positionY').onChange(value => this.object.position.y = de2ra(value));
        _folder1.add(parameters.model.position, 'z', -150, 150).name('positionZ').onChange(value => this.object.position.z = de2ra(value));

        _folder1.add(parameters.model.rotation, 'x', -180, 180).name('rotationX').onChange(value => this.object.rotation.x = de2ra(value));
        _folder1.add(parameters.model.rotation, 'y', -180, 180).name('rotationY').onChange(value => this.object.rotation.y = de2ra(value));
        _folder1.add(parameters.model.rotation, 'z', -180, 180).name('rotationZ').onChange(value => this.object.rotation.z = de2ra(value));

        let modelWireframe = _folder1.add(parameters.model, 'wireframe').name('wireframe').listen();
        modelWireframe.onChange(value => {
          this.object.traverse(child => {
            if (child.isMesh) {
              child.material.wireframe = value;
            }
          })
        });

        let _folder2 = this.gui.addFolder('Camera');
        _folder2.add(this.camera.position, 'x', -20, 20).name('position x');
        _folder2.add(this.camera.position, 'y', -20, 20).name('position y');
        _folder2.add(this.camera.position, 'z', -20, 20).name('position z');

      },
      updateModel() {
        const object = this.object;
        if (!object) return;
        const position = this.position;
        const rotation = this.rotation;
        const scale = this.scale;
        object.position.set(position.x, position.y, position.z);
        object.rotation.set(rotation.x, rotation.y, rotation.z);
        object.scale.set(scale.x, scale.y, scale.z);
      },
      updateRenderer() {
        const renderer = this.renderer;
        renderer.setSize(this.size.width, this.size.height);
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setClearColor(new Color(this.backgroundColor).getHex());
        renderer.setClearAlpha(this.backgroundAlpha);
      },
      updateCubemaps() {
        if (this.cubemap.length === 0) return;

        this.envMap = new CubeTextureLoader().load(this.cubemap);
        this.envMap.format = RGBFormat;
        this.scene.background = this.envMap;
      },
      updateCamera() {
        const camera = this.camera;
        const object = this.object;

        camera.aspect = this.size.width / this.size.height;
        camera.updateProjectionMatrix();

        if (!this.cameraLookAt && !this.cameraPosition && !this.cameraRotation && !this.cameraUp) {
          if (!object) return;
          const distance = getSize(object).length();
          camera.position.set(0, 0, 0);
          camera.position.z = distance;
          camera.lookAt(new Vector3());
        } else {
          camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
          camera.rotation.set(this.cameraRotation.x, this.cameraRotation.y, this.cameraRotation.z);
          camera.up.set(this.cameraUp.x, this.cameraUp.y, this.cameraUp.z);

          camera.lookAt(new Vector3(this.cameraLookAt.x, this.cameraLookAt.y, this.cameraLookAt.z));
        }
      },
      updateLights() {
        this.scene.remove.apply(this.scene, this.allLights);
        this.allLights = [];
        this.lights.forEach(item => {
          if (!item.type) return;
          const type = item.type.toLowerCase();
          let light = null;
          if (type === 'ambient' || type === 'ambientlight') {
            const color = item.color || 0x404040;
            const intensity = item.intensity || 1;
            light = new AmbientLight(color, intensity);
          } else if (type === 'point' || type === 'pointlight') {
            const color = item.color || 0xffffff;
            const intensity = item.intensity || 1;
            const distance = item.distance || 0;
            const decay = item.decay || 1;
            light = new PointLight(color, intensity, distance, decay);
            if (item.position) {
              light.position.copy(item.position);
            }
          } else if (type === 'directional' || type === 'directionallight') {
            const color = item.color || 0xffffff;
            const intensity = item.intensity || 1;
            light = new DirectionalLight(color, intensity);
            if (item.position) {
              light.position.copy(item.position);
            }
            if (item.target) {
              light.target.copy(item.target);
            }
          } else if (type === 'hemisphere' || type === 'hemispherelight') {
            const skyColor = item.skyColor || 0xffffff;
            const groundColor = item.groundColor || 0xffffff;
            const intensity = item.intensity || 1;
            light = new HemisphereLight(skyColor, groundColor, intensity);
            if (item.position) {
              light.position.copy(item.position);
            }
          }
          this.allLights.push(light);
          this.scene.add(light);
        })
      },
      updateControls() {
        if (this.controllable && this.controls) return;
        if (this.controllable) {
          if (this.controls) return;
          this.controls = new OrbitControls(this.camera, this.$refs.canvas);
          this.controls.enableDamping = true;
          this.controls.dampingFactor = 0.25;
          this.controls.type = 'orbit';
          this.controls.update();
        } else {
          if (this.controls) {
            this.controls.dispose();
            this.controls = null;
          }
        }
      },
      animate() {
        this.reqId = requestAnimationFrame(this.animate);
        // required if controls.enableDamping or controls.autoRotate are set to true
        this.controls.update();

        if (this.statsjs && this.stats !== null) this.stats.update();

        if (this.mixer) this.mixer.update(this.clock.getDelta());

        this.render();
      },
      render() {
        this.renderer.render(this.scene, this.camera)
      },
      toggleFullscreen() {
        if (ScreenFull.enabled) {
          ScreenFull.toggle(this.$el);
          ScreenFull.on('change', () => {
            this.fullscreen = ScreenFull.isFullscreen;

            if (!ScreenFull.isFullscreen) this.size = this.initSize;

            this.updateCamera();
            this.updateRenderer();
          });
        }
      },
      resetCameraView() {
        this.controls.reset();
      },
      toggleHelp() {
        this.showHelp = !this.showHelp;
      },
      downloadModel() {

      },
      load() {
        if (!this.src) return;
        if (this.object) {
          this.wrapper.remove(this.object);
        }
        this.loader.load(this.src, (...args) => {
          const object = this.getObject(...args);
          if (this.process) {
            this.process(object);
          }
          this.addObject(object);
          this.$emit('on-load');
        }, xhr => {
          this.$emit('on-progress', xhr);
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, err => {
          this.$emit('on-error', err);
          console.log('on-error', err);
        });
      },
      getObject(object) {
        return object
      },
      addObject(object) {
        const center = getCenter(object);
        // correction position
        this.wrapper.position.copy(center.negate());
        this.object = object;
        this.wrapper.add(object);

        this.updateCamera();
        this.updateModel();
      },
    }
  }
</script>

<style scoped>
  @import url(https://use.fontawesome.com/releases/v5.1.0/css/all.css);
  @import url('https://fonts.googleapis.com/css?family=Open+Sans');

  .model-viewer {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    position: relative;
    overflow: hidden;
    font-family: "Open Sans", sans-serif;
  }

  .webgl {
    position: relative;
  }

  #datgui {
    position: absolute;
    top: 0;
    right: 0;
  }

  canvas {
    width: 100%;
    height: 100%
  }

  /** GUI **/
  .gui {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 4;
    pointer-events: none;
    user-select: none;
    opacity: 0;
    transition: opacity 250ms ease-in-out;
  }

  .gui.enabled {
    opacity: 1;
  }

  .controls {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    height: 50px;
    justify-content: space-between;
    min-width: 0;
    padding: 10px;
    pointer-events: none;
    display: flex;
  }

  .controls .general-controls {
    display: flex !important;
    justify-content: flex-end;
    flex: 0 0 auto;
    font-size: 13px;
    align-items: center;
    flex-flow: row nowrap !important;
    margin-left: auto;
  }

  .controls a {
    padding: 0;
    margin: 0;
    color: #ffffff;
    text-decoration: none;
    cursor: pointer;
  }

  .controls .control {
    position: relative;
    display: inline-block;
    min-width: 0;
    margin: 0 5px;
    font-size: 16px;
    outline: none;
    transition: background 200ms linear;
    width: 30px;
    height: 30px;
    line-height: 31px;
    text-align: center;
    border-radius: 16px;
    pointer-events: all;
  }

  .controls .control:hover,
  .controls .control.active {
    background: rgba(0, 0, 0, 0.75);
  }

  .controls .control:before {
    color: #ffffff;
    text-shadow: 0 0 1px black;
  }

  .controls .general-controls .control i {
    color: #ffffff;
    text-shadow: 0 0 1px #000000;
    pointer-events: none;
  }

  .control-tooltip {
    position: relative;
  }

  .control-tooltip.tooltip-down[data-tooltip]:after {
    top: 25px;
    bottom: auto;
  }

  .control-tooltip.tooltip-down[data-tooltip]:before {
    top: 20px;
    bottom: auto;
    border-top: 0 solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid rgba(0, 0, 0, 0.75);
    border-left: 5px solid transparent;
  }

  .control-tooltip.tooltip-right-bound[data-tooltip]:after {
    transform: translateX(-75%);
  }

  .control-tooltip.tooltip-left-bound[data-tooltip]:before {
    transform: translateX(100%);
    left: 0;
  }

  .control-tooltip.tooltip-left-bound[data-tooltip]:after {
    transform: translateX(0%);
    left: 0;
  }

  .control-tooltip[data-tooltip]:before {
    position: absolute;
    bottom: 30px;
    left: 50%;
    pointer-events: none;
    content: "";
    border-top: 5px solid rgba(0, 0, 0, 0.75);
    border-right: 5px solid transparent;
    border-bottom: 0 solid transparent;
    border-left: 5px solid transparent;
    opacity: 0;
    transition: opacity 250ms ease-in-out;
    transform: translateX(-50%);
  }

  .control-tooltip[data-tooltip]:after {
    position: absolute;
    bottom: 35px;
    left: 50%;
    height: 25px;
    padding: 5px 10px;
    font-size: 12px;
    line-height: 15px;
    color: #ffffff;
    white-space: nowrap;
    pointer-events: none;
    content: attr(data-tooltip);
    background: rgba(0, 0, 0, 0.75);
    border-radius: 6px;
    opacity: 0;
    transition: opacity 250ms ease-in-out;
    transform: translateX(-50%);
  }

  .control-tooltip:hover:before, .control-tooltip:hover:after {
    opacity: 1;
  }

  /** OVERLAYS **/
  .overlays {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 7;
    pointer-events: none;
    perspective: 1000px;
    perspective-origin: center center;
    transform-style: preserve-3d;
  }

  .overlays .overlay {
    position: absolute;
    top: 0;
    left: 0;
    z-index: initial;
    display: initial;
    width: 100%;
    height: 100%;
    overflow: initial;
    pointer-events: all;
    background: rgba(0, 0, 0, 0.8);
    transition: all 250ms ease-in-out;
  }

  .overlays .overlay.hidden {
    pointer-events: none;
    opacity: 0;
    transition: all 100ms ease-in-out;
    transform: translateZ(100px);
  }

  .overlays .overlay .close {
    position: absolute;
    top: 15px;
    right: 25px;
    z-index: 2;
    font-size: 16px;
    color: #ffffff;
  }

  .overlays .overlay .inner {
    position: absolute;
    top: 0;
    left: 0;
    display: -ms-flexbox;
    display: flex;
    width: 100%;
    height: 100%;
    color: #ffffff;
    flex-flow: column nowrap;
    justify-content: center;
  }

  .overlays .overlay .inner > * {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-pack: center;
    justify-content: center;
  }

  /** help **/
  .overlays .overlay.help .inner {
    display: flex;
    flex-direction: row;
    flex: 1 1 0;
    justify-content: center;
    overflow: auto;
  }

  .overlays .overlay.help .inner .tip {
    display: -ms-flexbox;
    display: flex;
    font-size: 14px;
    color: #cccccc;
    text-align: center;
    flex-direction: column;
    flex: 1;
    justify-content: center;
  }

  .overlays .overlay.help .tip > div {
    min-height: 0;
    max-height: none;
  }

  .overlays .overlay.help .tip i {
    margin: 0 0 30px;
    font-size: 28px;
    color: #ffffff;
  }

  .overlays .overlay.help {
    padding: 0 20px;
    font-size: 18px;
    color: #cccccc;
    justify-content: center;
  }

  .overlays .overlay.help h2 {
    position: relative;
    padding-bottom: 4px;
    margin: 0 0 4px;
    font-size: 13px;
    font-weight: bold;
    text-transform: uppercase;
    border-bottom: 1px solid #333333;
  }

  .overlays .overlay.help .section {
    margin-bottom: 20px;
    line-height: 1.7;
  }

  .overlays .overlay.help b {
    display: inline-block;
    width: 120px;
    font-weight: bold;
  }
</style>

<template>
  <div class="model-viewer" v-if="suportWebGL">
    <div class="overlays">
      <div class="overlay help" :class="showHelp ? '' : 'hidden'">
        <a href="#" class="close" v-on:click="toggleHelp"><i class="fas fa-times"></i></a>
        <div class="inner">
          <div class="tip">
            <div><i class="fas fa-sync-alt"></i></div>
            <div>
              <b>Orbit around</b>
              <div>Left mouse + drag or<br>One finger drag (touch)</div>
            </div>
          </div>
          <div class="tip">
            <div><i class="fas fa-search-plus"></i></div>
            <div>
              <b>Zoom</b>
              <div>Middle mouse or mousewheel<br>Two-finger spread or squish (touch)</div>
            </div>
          </div>
          <div class="tip">
            <div><i class="fas fa-arrows-alt"></i></div>
            <div>
              <b>Pan</b>
              <div>Right mouse + drag or arraow keys<br>Two fingers drag (touch)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="webgl">
      <div id="datgui" ref="datgui"></div>
      <canvas ref="canvas"></canvas>
      <div v-show="showControls" class="gui enabled">
        <div class="controls">
          <div class="general-controls">
            <a class="control control-tooltip" data-tooltip="Help" v-on:click="toggleHelp"
               v-show="visibleControls.help">
              <i class="fas fa-question"></i>
            </a>
            <a class="control control-tooltip" data-tooltip="Download" v-on:click="downloadModel"
               v-show="visibleControls.download">
              <i class="fas fa-download"></i>
            </a>
            <a class="control control-tooltip tooltip-right-bound" data-tooltip="Fullscreen"
               v-on:click="toggleFullscreen" v-show="visibleControls.fullscreen">
              <i class="fas" :class="fullscreen ? 'fa-compress' : 'fa-expand-arrows-alt'"></i></a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <slot name="error">
      Your graphics card does not seem to support
      <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>
      Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.
    </slot>
  </div>
</template>

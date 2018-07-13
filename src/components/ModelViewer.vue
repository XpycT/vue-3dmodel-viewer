<script>
  import base from '../mixins/base-mixin.vue'
  import {AnimationMixer} from 'three';
  import {ModelLoader} from "../loaders";

  export default {
    name: 'model-viewer',
    mixins: [base],
    data() {
      return {
        loader: new ModelLoader()
      }
    },
    created() {

    },
    methods: {
      load() {
        if (!this.src) return;
        if (this.object) {
          this.wrapper.remove(this.object);
        }
        this.loader.load(this.src, data => {
          //env maps
          if (this.envMap !== null) {
            data.model.traverse(node => {
              if (node.material && (node.material.isMeshStandardMaterial ||
                (node.material.isShaderMaterial && node.material.envMap !== undefined))) {
                node.material.envMap = this.envMap;
                node.material.needsUpdate = true;
              }

              if (node.isMesh || node.isLight) node.castShadow = true;
            })
          }
          //animations
          let animations = data.originalResult.animations;
          if (animations && animations.length) {
            this.mixer = new AnimationMixer(data.model);
            for (let i = 0; i < animations.length; i++) {
              let animation = animations[i];
              // There's .3333 seconds junk at the tail of the Monster animation that
              // keeps it from looping cleanly. Clip it at 3 seconds
              if (this.animationTime) {
                animation.duration = this.animationTime;
              }
              let action = this.mixer.clipAction(animation);
              if (this.playAnimation) {
                action.play();
              }
            }
          }

          this.addObject(data.model);
          this.$emit('on-load');
        }, xhr => {
          this.$emit('on-progress', xhr);
        }, err => {
          console.log(err);
          this.$emit('on-error', err);
        });
      }
    }
  }

</script>

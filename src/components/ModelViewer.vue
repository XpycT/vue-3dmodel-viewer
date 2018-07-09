<script>
  import base from '../mixins/base-mixin.vue'
  import {GLTFLoader} from "../loaders";

  export default {
    name: 'model-viewer',
    mixins: [ base ],
    data() {
      return {
        loader: new GLTFLoader()
      }
    },
    methods: {
      load() {
        if ( !this.src ) return;
        if ( this.object ) {
          this.wrapper.remove( this.object );
        }
        this.loader.load( this.src, data => {
          if(this.envMap !== null){
            data.scene.traverse( child => {
              if(child.isMesh){
                child.material.envMap = this.envMap;
              }
            })
          }
          this.addObject( data.scene );
          this.$emit( 'on-load' );
        }, xhr => {
          this.$emit( 'on-progress', xhr );
        }, err => {
          console.log( err );
          this.$emit( 'on-error', err );
        } );
      }
    }
  }

</script>

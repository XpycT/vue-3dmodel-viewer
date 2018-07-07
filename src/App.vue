<template>
    <div id="app">
        <ModelViewer :lights="lights" :background-color="backgroundColor"></ModelViewer>
    </div>
</template>

<script>
    import { Vector3 } from 'three';

    import ModelViewer from './components/ModelViewer.vue'

    export default {
        name: 'app',
        components: {
            ModelViewer
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
                backgroundColor: 0x444444
            }
        }
    }
</script>

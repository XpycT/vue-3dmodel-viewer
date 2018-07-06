<script>
    import {
        Color,
        Vector3,
        Scene,
        Mesh,
        BoxGeometry,
        MeshLambertMaterial,
        WebGLRenderer,
        PerspectiveCamera,
        AmbientLight,
        PointLight,
        DirectionalLight,
        HemisphereLight
    } from 'three'

    const suportWebGL = (() => {
        try {
            let canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    })();

    export default {
        name: 'ModelViewer',
        props: {
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
                default: 0x111111
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
        },
        data() {
            return {
                suportWebGL,
                size: {
                    width: this.width,
                    height: this.height
                },
                object: null,
                camera: new PerspectiveCamera(45, 1, 0.01, 100000),
                scene: new Scene(),
                renderer: null,
                controls: null,
                allLights: [],
                reqId: null    // requestAnimationFrame id
            }
        },
        mounted() {
            if (this.width === undefined || this.height === undefined) {
                this.size = {
                    width: this.$el.offsetWidth,
                    height: this.$el.offsetHeight
                }
            }

            this.renderer = new WebGLRenderer({antialias: true, alpha: true, canvas: this.$refs.canvas});
            this.renderer.shadowMap.enabled = true;

            this.update();

            window.addEventListener('resize', this.onResize, false);

            const geo = new BoxGeometry(1, 1, 1);
            const mat = new MeshLambertMaterial({color: 0xffffff});
            const box = new Mesh(geo, mat);
            box.castShadow = true;
            this.scene.add(box);

            this.animate();
        },
        beforeDestroy() {
            cancelAnimationFrame(this.reqId);
            window.removeEventListener('resize', this.onResize, false);
        },
        computed: {},
        methods: {
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
                this.updateCamera();
                this.updateLights();
            },
            updateRenderer() {
                const renderer = this.renderer;
                renderer.setSize(this.size.width, this.size.height);
                renderer.setPixelRatio(window.devicePixelRatio || 1);
                renderer.setClearColor(new Color(this.backgroundColor).getHex());
                renderer.setClearAlpha(this.backgroundAlpha);
            },
            updateCamera() {
                const camera = this.camera;
                camera.aspect = this.size.width / this.size.height;
                camera.updateProjectionMatrix();
                if (!this.cameraLookAt && !this.cameraPosition && !this.cameraRotation && !this.cameraUp) {
                    camera.position.set(1, 1, -2);
                    camera.position.z = 5;
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
            animate() {
                this.reqId = requestAnimationFrame(this.animate);
                this.render();
            },
            render() {
                this.renderer.render(this.scene, this.camera)
            }
        }
    }
</script>

<style scoped>
    canvas {
        width: 100%;
        height: 100%
    }
</style>

<template>
    <canvas v-if="suportWebGL" ref="canvas"></canvas>
    <div v-else>
        <slot>
            Your graphics card does not seem to support <a
                href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>
            Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.
        </slot>
    </div>
</template>
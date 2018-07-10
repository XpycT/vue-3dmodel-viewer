import ModelViewer from './components/ModelViewer.vue';

const components = [
    ModelViewer
];

const install = ( Vue ) => {
    components.map( component => {
        Vue.component( component.name, component );
    } );
};

if ( typeof window !== 'undefined' && window.Vue ) {
    install( window.Vue );
}

/*export default {
    install,
    ModelViewer
}*/

export {
    install,
    ModelViewer
}

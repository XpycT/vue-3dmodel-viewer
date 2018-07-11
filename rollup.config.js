import fs from 'fs'
import path from 'path'
import {uglify} from 'rollup-plugin-uglify'
import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import json from 'rollup-plugin-json';

const commitHash = (function () {
  try {
    return fs.readFileSync('.commithash', 'utf-8');
  } catch (err) {
    return 'unknown';
  }
})();

const now = new Date(
  process.env.SOURCE_DATE_EPOCH ? process.env.SOURCE_DATE_EPOCH * 1000 : new Date().getTime()
).toUTCString();

const pkg = require('./package.json');

const banner = `/*!
 * vue-3dmodel-viewer v${pkg.version}, ${pkg.description}
 * ${now} - commit ${commitHash}
 * (c) ${new Date().getFullYear()} Aleksandr Tar <XpycT.TOP@gmail.com>
 *
 * ${pkg.homepage}
 *
 * Released under the MIT License.
 */`;

let plugins = [
  json(),
  vue({
    css: true
  }),
  postcss({
    plugins: [
      autoprefixer()
    ]
  }),
  buble({
    objectAssign: 'Object.assign'
  }),
  resolve({
    customResolveOptions: {
      moduleDirectory: 'node_modules'
    }
  }),
  commonjs()
];

export default [{
  input: path.join(__dirname, 'src', 'index.js'),
  plugins,
  output: [
    {file: pkg.module, format: 'es', sourcemap: true, banner},
    {file: pkg.main, format: 'umd', sourcemap: true, banner, name: "Vue3DModelViewer"}
  ]
}, {
  input: path.join(__dirname, 'src', 'index.js'),
  plugins: [uglify()].concat(plugins || []),
  output: {file: pkg.unpkg, format: 'umd', sourcemap: true, banner, name: "Vue3DModelViewer"}

}];

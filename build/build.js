import path from 'path'
import {uglify} from 'rollup-plugin-uglify'
import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import {rollup} from 'rollup'
import chalk from 'chalk'

const version = require('../package.json').version;
const banner =
  '/*!\n' +
  ' * vue-3dmodel-viewer v' + version + '\n' +
  ' * (c) ' + new Date().getFullYear() + ' Aleksandr Tar <XpycT.TOP@gmail.com>\n' +
  ' * Released under the MIT License.\n' +
  ' */'

const configs = {
  umd: {
    output: 'vue-3dmodel-viewer.js',
    format: 'umd'
  },
  umdMin: {
    output: 'vue-3dmodel-viewer.min.js',
    format: 'umd',
    plugins: [uglify()]
  },
  cjs: {
    output: 'vue-3dmodel-viewer.common.js',
    format: 'cjs'
  },
  esm: {
    output: 'vue-3dmodel-viewer.esm.js',
    format: 'es'
  }
}

async function build () {
  Object.keys(configs).forEach(async function (key) {
    const config = configs[key]
    console.log(chalk.cyan(`Building ${key}: ${config.output}`))
    const inputOptions = {
      //input: path.join(__dirname, '..', 'src', 'components', 'ModelViewer.vue'),
      input: path.join(__dirname, '..', 'src', 'index.js'),
      plugins: [
        resolve(),
        commonjs(),
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
        })
      ].concat(config.plugins || [])
    }
    const bundle = await rollup(inputOptions)
    const outputOptions = {
      file: path.join(__dirname, '..', 'dist', config.output),
      format: config.format,
      banner: banner,
      name: 'vue3dModelViewer'
    }
    await bundle.write(outputOptions)
  })
  await console.log(chalk.green('All modules built'))
}

build()

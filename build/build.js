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

const pkg = require('../package.json');
const banner =
  '/*!\n' +
  ' * vue-3dmodel-viewer v' + pkg.version + ', ' + pkg.description + '\n' +
  ' * (c) ' + new Date().getFullYear() + ' Aleksandr Tar <XpycT.TOP@gmail.com>\n' +
  ' * Released under the MIT License.\n' +
  ' */'

const configs = {
  umd: {
    output: pkg.main,
    format: 'umd'
  },
  umdMin: {
    output: pkg.unpkg,
    format: 'umd',
    plugins: [uglify()]
  },
  cjs: {
    output: pkg.common,
    format: 'cjs'
  },
  esm: {
    output: pkg.module,
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
      file: path.join(__dirname, '..', config.output),
      format: config.format,
      banner: banner,
      name: 'Vue3DModelViewer'
    }
    await bundle.write(outputOptions)
  })
  await console.log(chalk.green('All modules built'))
}

build()

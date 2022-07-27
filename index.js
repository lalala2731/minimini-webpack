

// 注：main以及foo里面的内容就叫做asset，即 资源

import fs from 'fs'
import parser from '@babel/parser'
import traverse from '@babel/traverse'
import path from 'path'
import ejs from 'ejs'
import { transformFromAst } from 'babel-core'
import webpackConfig from './webpack.config.js'
import { SyncHook } from 'tapable'
// import { jsonLoader } from './jsonLoader.js'

// const webpackConfig = {
//     module: {
//         rules: [
//             {
//                 test: /\.json$/,
//                 use: [jsonLoader],
//             }
//         ]
//     }
// }

let id = 0

// 初始化hooks
const hooks = {
    emitFile: new SyncHook(['context'])// 同步的即可
}

function createAsset(filePath) {
    // 1.获取文件内容


    let source = fs.readFileSync(filePath, 'utf-8');

    // console.log(source);

    // loader转换
    let loaders = webpackConfig.module.rules
    // console.log(loader);

    // 上下文对象
    const loaderContext = {
        addDeps(dep) {
            console.log('addDeps', dep);
        }
    }

    loaders.forEach(({ test, use }) => {
        if (test.test(filePath)) {
            if (Array.isArray(use)) {
                use.reverse().forEach(fn => {
                    source = fn.call(loaderContext, source)
                })
            }
            // source = use(source)
        }
    })


    // 2.获取依赖关系
    // 2.1 通过正则检测import
    // 2.2 ast

    const ast = parser.parse(source, {
        sourceType: 'module',
    });
    // console.log(ast);
    // 获取到ast之后，需要通过遍历拿到其中的节点，就通过babel的工具：@babel/traverse

    const deps = []// 存储依赖关系
    traverse.default(ast, {
        ImportDeclaration({ node }) {
            deps.push(node.source.value);
        }
    })

    // babel-core转换，将esm转换为cjs
    const { code } = transformFromAst(ast, null, {
        presets: ['env']
    })

    // console.log(code);

    return {
        filePath,
        code,// 当前内容
        deps,// 依赖关系,
        id: id++,
        mapping: {}// 依赖的asset
    }
}

// const assets = createAsset()
// console.log(assets);

// 将当前内容和依赖关系合成一个图对象
function createGraph() {
    // 得到一个入口
    const mainAsset = createAsset('./example/main.js')
    // 然后基于入口的依赖关系找到下一个模块，将下一个模块的路径给到createAsset，
    // 再得到asset，将其存起来，构建出图结构

    // 使用队列的形式搜索：广度优先搜索
    const queue = [mainAsset]
    for (const asset of queue) {
        asset.deps.forEach(relativePath => {
            // console.log(relativePath); ./bar.js;./foo.js
            // 路径拼接
            const child = createAsset(path.resolve('./example', relativePath))
            asset.mapping[relativePath] = child.id// 设置依赖的mapping=id
            queue.push(child)
        });
    }
    return queue
}


// 一开始就初始化插件
function initPlugins() {
    const plugins = webpackConfig.plugins;
    plugins.forEach(plugin => {
        console.log(plugin);
        plugin.apply(hooks)
    })
}
initPlugins()

const graph = createGraph()
// console.log(graph);



function build(graph) {
    const template = fs.readFileSync('./bundle.ejs', 'utf-8')
    const data = graph.map(asset => {
        const { id, code, mapping } = asset
        return {
            id,
            code,
            mapping
        }
    })
    // console.log(data);
    const code = ejs.render(template, { data })
    // console.log(code);
    // console.log(data);
    let outputPath = './dist/bundle.js'
    const context = {
        changeOutputPath(path) {
            outputPath = path
        }
    }
    hooks.emitFile.call(context)

    fs.writeFileSync(outputPath, code)
}
build(graph)
// 接下来就是把数据给到模板，去渲染生成内容


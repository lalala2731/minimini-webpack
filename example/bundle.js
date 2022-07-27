(function (modules) {
    // 调用导出函数的exports函数
    function require(id) {
        const [fn, mapping] = modules[id]
        const module = {
            exports: {}
        }

        // 因为在main.js中，require中传入的是一个filePath，但是require
        // 接受一个id，所以需要将filePath转换成id
        function localRequire(filePath) {// 装饰器
            const id = mapping[filePath];
            return require(id);
        }
        // 所以不在传require，需要传的是localRequire。
        fn(localRequire, module, module.exports)

        // fn(require, module, module.exports)
        return module.exports
    }
    require(1)
    //// 以上是最后要变成的样子，先实现一个
    // 后续就是根据创建的graph，创建bundle.js
})({
    1: [function (require, module, exports) {
        // mainjs
        const { foo } = require('./foo.js');//  将esm的导入规范翻译成cjs的规范，再实现一个导入函数即可
        foo()
        console.log('main.js');
    }, {
        './foo.js': 2
    }],

    2: [function (require, module, exports) {
        // foojs
        function foo() {
            console.log('foo');
        }
        module.exports = {
            foo
        }
    }, {}],
})
// 使用ejs模板生成器生成bundle.js文件
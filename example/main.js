
import { foo } from './foo.js'
import user from './user.json'
// import bar from './bar.js'
// 它们之间是一个图，因为有可能相互引用
// 1.获取内容
// 2.获取依赖关系
console.log(user);
foo()
console.log('main');
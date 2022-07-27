export function jsonLoader(source) {
    console.log('sss', source);
    this.addDeps('jsonLoader')// 这些有可能改变webpack的一些行为的
    return `export default ${JSON.stringify(source)}`
}
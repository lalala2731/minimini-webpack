
export class changeOutputPath {
    constructor(path) {
        this.path = path
    }
    apply(hooks) {
        hooks.emitFile.tap('changeOutputPath', (context) => {
            console.log('----------');
            context.changeOutputPath(this.path)
        })
    }
}
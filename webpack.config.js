import path from 'path'
import { jsonLoader } from './jsonLoader.js'
import { changeOutputPath } from './changeOutputPath.js'
export default {
    module: {
        rules: [
            {
                test: /\.json$/,
                use: [jsonLoader],
            }
        ]
    },
    plugins: [
        new changeOutputPath('./dist/nn.js'),
    ]
}
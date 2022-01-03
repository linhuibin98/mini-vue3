import {defineConfig} from 'rollup';

export default defineConfig({
    input: 'src/index.js',
    output: {
        file: 'dist/vue.js',
        format: 'umd',
        name: 'vue'
    },
    watch: {
        chokidar: {},
        clearScreen: true,
        include: 'src/**'
    }
});
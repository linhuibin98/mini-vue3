import {defineConfig} from 'rollup';
import resolve from 'rollup-plugin-node-resolve';

export default defineConfig({
    input: 'src/index.js',
    output: {
        file: 'dist/vue.js',
        format: process.env.NODE_ENV === 'production' ? 'umd' : 'esm',
        name: 'vue'
    },
    plugins: [resolve()],
    watch: {
        chokidar: {},
        clearScreen: true,
        include: 'src/**'
    }
});
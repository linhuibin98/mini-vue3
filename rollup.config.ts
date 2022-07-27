import {defineConfig} from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
    input: 'src/index.ts',
    output: {
        file: 'dist/vue.js',
        format: process.env.NODE_ENV === 'production' ? 'umd' : 'esm',
        name: 'vue'
    },
    plugins: [nodeResolve(), typescript()],
    watch: {
        chokidar: {},
        clearScreen: true,
        include: 'src/**'
    }
});
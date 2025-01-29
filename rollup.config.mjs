import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const basePlugins = [
    json(),
    resolve(),
    commonjs(),
    postcss({
        extract: "datetimepicker.min.css",
        minimize: true,
        plugins: [
            autoprefixer,
            cssnano({
                preset: 'default',
            })
        ],
        sourceMap: true,
    }),
]

export default {
    input: 'src/index.js',
    output: [
        {
            file: "dist/datetimepicker.js",
            format: "umd",
            name: "DatetimePicker",
            sourcemap: true,
            plugins: [terser()]
        },
        {
            file: "dist/datetimepicker.esm.js",
            format: "es",
            sourcemap: true,
            plugins: [terser()]
        },
        {
            file: "dist/datetimepicker.min.js",
            format: "iife",
            name: "DatetimePicker",
            sourcemap: false,
            plugins: [terser()]
        }
    ],
    plugins: basePlugins,
};
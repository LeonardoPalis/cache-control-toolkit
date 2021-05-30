import typescript from 'rollup-plugin-typescript';

export default [{
  input: './src/lib/index.ts',
  output: {
    dir: 'lib',
    format: 'cjs'
  },
  plugins: [typescript({lib: ["es5", "es6", "dom"], target: "es6"})]
},];
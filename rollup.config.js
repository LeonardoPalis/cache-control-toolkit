import typescript from 'rollup-plugin-typescript';

export default [{
  input: './index.ts',
  output: {
    dir: 'core',
    format: 'cjs'
  },
  plugins: [typescript({lib: ["es5", "es6", "dom"], target: "es5"})]
},];
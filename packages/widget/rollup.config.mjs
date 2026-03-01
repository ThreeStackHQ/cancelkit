import terser from "@rollup/plugin-terser";

export default {
  input: "src/cancelkit.js",
  output: [
    {
      file: "dist/cancelkit.js",
      format: "iife",
      name: "CancelKit",
      exports: "default",
    },
    {
      file: "dist/cancelkit.min.js",
      format: "iife",
      name: "CancelKit",
      exports: "default",
      plugins: [terser()],
    },
  ],
};

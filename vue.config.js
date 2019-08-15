module.exports = {
  chainWebpack: config => {
    config.module
      .rule('shader')
      .test(/\.(glsl|vs|fs)$/)
      .use('shader-loader')
        .loader('shader-loader')
        .tap(options => {
          const newOptions = {
            // glsl: { chunkPath: resolve("/glsl/chunks") }
          };

          return { ...options, ...newOptions };
        })
        .end()
  }
} 
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const devConfig = require('./webpack.dev.js');
const prodConfig = require('./webpack.prod.js');

module.exports = (env) => {
    if (env.production) {
        return merge(commonConfig, prodConfig);
    }
    return merge(commonConfig, devConfig);
};
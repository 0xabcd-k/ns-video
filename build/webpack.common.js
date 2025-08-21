const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const dirname = __dirname.replace('build','');
const webpack = require("webpack");
module.exports = {
    entry: path.resolve(dirname, 'src/main.jsx'),
    resolve: {
        alias: {
            '@': path.join(dirname, 'src'),
        },
        extensions: ['.tsx','.jsx','.ts','.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.jsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            babelrc: false,
                            presets: [
                                [require.resolve('@babel/preset-react'), { runtime: 'automatic' }],
                                [require.resolve('@babel/preset-env'), { modules: false }],
                            ]
                        }
                    }
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpe?g|gif|mp3|svg)$/,
                type: 'asset/resource'
            },
            {
              test: /\.(woff|woff2|eot|ttf|otf)$/i,
              type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(dirname, 'public/index.html')
        }),
        new webpack.DefinePlugin({
            __BUILD_VERSION__: JSON.stringify(new Date().toISOString().replace(/[-:.TZ]/g, ""))
        }),
    ]
};

const path = require("path");
const dirname = __dirname.replace('build','');


module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(dirname, 'dist'),
        clean: true,
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader","css-loader", "postcss-loader"],
            },
            {
                test: /\.less$/,
                use: ["style-loader","css-loader","postcss-loader","less-loader"],
            },
        ],
    },
    devServer: {
        historyApiFallback: true,
        port: "80",
        host:'local.netshort.online',
        //host:'127.0.0.1',
        headers: {
            'Content-Security-Policy': ''
        },
        proxy: [
            {
                context: ['/api'],
                // #TEST
                target: 'http://localhost:13001',
                changeOrigin: true,
                secure: true,
                pathRewrite: {
                    '^/api': ''
                },
                plugins: [function(server, opts){
                    console.log(server, opts);
                }]
            }
        ],
    },
};


module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
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

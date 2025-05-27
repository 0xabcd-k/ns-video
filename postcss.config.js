module.exports = {
    plugins: [
        require('postcss-pxtorem')({
            rootValue:37.5,
            propList: ['*'],
            exclude: /node_modules/i,
            unitPrecision:5,
            minPixelValue: 12, //px小于12的不会被转换
        }),
        require('autoprefixer')({
            overrideBrowserslist: [
                'iOS >= 8',      // 针对 iOS 8 及以上的设备（兼容 iPhone 6）
                'last 2 versions',  // 保证对现代浏览器的兼容
                '> 1%',             // 覆盖市场占有率大于 1% 的浏览器
                'not dead'          // 不包含已经停止更新的浏览器
            ]
        })
    ]
}
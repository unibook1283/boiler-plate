if(process.env.NODE_ENV === 'production') {
    module.exports = require('./prod');     // 배포 후에는 이걸로
} else {
    module.exports = require('./dev');      // 개발 중일 땐 이걸로
}
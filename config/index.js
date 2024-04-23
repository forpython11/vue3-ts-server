module.exports = {
    // token密钥
    jwtSecretKey: 'you are the best!',
    jwtRefrechSecretKey: 'be a better one!',
    secretKeyExpire: 60 * 60 * 2,  // 2小时
    refreshSerectKeyExpire: 60 * 60 * 24 * 2, //2天
    // redis库配置信息
    post: 6379,
    url: '127.0.0.1',
    password: 123456

}

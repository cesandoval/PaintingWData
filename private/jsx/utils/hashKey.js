const hashKey = () =>
    (+new Date()).toString(32) + Math.floor(Math.random() * 36).toString(36)

export default hashKey

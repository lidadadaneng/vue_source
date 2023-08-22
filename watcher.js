const {Dep} = require('./defineReactive')

let watcherId = 0
// watcher任务队列
let watcherQueue = []
// 5、Watcher类: 触发依赖收集、处理更新回调
class Watcher {
    constructor(vm, exp, cb) {
        // 5.1、将Vue实例、data属性名和更新回调 挂载到watcher实例上
        this.vm = vm
        this.exp = exp
        this.cb = cb
        this.id = ++watcherId
        // 5.2、触发data数据的getter 完成依赖收集
        this.get()
    }
    get() {
        // 5.3、将Watcher实例设为 Dep依赖收集的目标对象
        Dep.target = this
        // 5.4、触发data数据getter拦截器
        this.vm[this.exp]
        // 清空依赖目标对象
        Dep.target = null
    }
    run(newVal,value) {
        // 5.8 如果该任务已存在与任务队列中 则终止
        if (watcherQueue.indexOf(this.id)!==-1) return
        // 5.9 将当前watcher添加到 队列中
        watcherQueue.push(this.id)
        const index = watcherQueue.length - 1
        Promise.resolve().then(() => {
            this.cb.call(this.vm, newVal, value)
            // 5.10 任务执行结束 将其从任务队列中删除
            watcherQueue.splice(index, 1)
        })
    }
}
exports.Watcher = Watcher

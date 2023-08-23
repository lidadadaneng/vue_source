const {Dep} = require('./defineReactive')

let watcherId = 0
// watcher任务队列
let watcherQueue = []
// 5、Watcher类: 触发依赖收集、处理更新回调
class Watcher {
    constructor(vm, exp, cb,option = {}) {
        // 8.13 watcher增加新参数 option ，对watcher进行默认配置
        this.lazy = this.dirty = !!option.lazy
        // 5.1、将Vue实例、data属性名和更新回调 挂载到watcher实例上
        this.vm = vm
        this.exp = exp
        this.cb = cb
        this.id = ++watcherId
        // 8.14 惰性watcher 初始化时不需要收集依赖
        if(!option.lazy) {
            // 5.2、触发data数据的getter 完成依赖收集
            this.get()
        }
    }
    get() {
        // 5.3、将Watcher实例设为 Dep依赖收集的目标对象
        Dep.target = this
        // 8.1  收集依赖之前先判断是否为函数 计算属性求值时会传入函数
        if(typeof this.exp === 'function'){
            // 8.2 执行函数 并求出值
            this.value = this.exp.call(this.vm)
        }else {
            // 5.4、触发data数据getter拦截器
            this.value = this.vm[this.exp]
        }
        // 清空依赖目标对象
        Dep.target = null
    }
    // 8.11 在调用run之前先调用update，判断是否要直接run
    update(newVal, value) {
        // 8.12 依赖更新当前watcher为惰性时，不要直接run。而是将watcher标记为脏数据，等到用户主动获取结果再去run
        if(this.lazy) {
            this.dirty = true
        }else {
            thiss.run(newVal, value)
        }
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

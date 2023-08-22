const {observe,defineReactive} = require('./defineReactive')
const {Watcher} = require('./watcher')

class Vue {
    constructor(options) {
        // 将配置项挂在到Vue实例上
        this.$options = options
        this._data = options.data
        // 通过initData完成data初始化(将data属性挂载在到Vue实例上)
        this.initData()
        this.initWatch()
    }

    initData() {
        let data = this._data
        let keys = Object.keys(data)
        // 数据代理
        // 遍历data 将data所有字段代理到Vue实例上
        for (let i = 0; i < keys.length; i++) {
            Object.defineProperty(this, keys[i], {
                enumberable: true,
                configurable: true,
                set: function proxySetter(newVal) {
                    data[keys[i]] = newVal
                },
                get: function prosyGetter() {
                    return data[keys[i]]
                }
            })
        }

        // 数据劫持
        observe(data)
    }

    initWatch() {
        const watches = this.$options.watch
        // 存在watch选项
        if (watches) {
            const keys = Object.keys(watches)
            for (let index = 0; index < keys.length; index++) {
                new Watcher(this, keys[index], watches[keys[index]])
            }
        }
    }

    // 6、动态添加订阅回调
    $watch(key, cb) {
        new Watcher(this, key, cb)
    }

    // 6.6 __ob__的挂载，依赖的收集工作已做完
    $set(target,key,value) {
        const oldValue = {...target}
        // 6.7 将传入的新属性也变为响应式
        defineReactive(target,key,value)
        // 6.8 手动派发依赖更新
        target.__ob__.dep.notify(oldValue,target)
    }

}

// 测试
let VM = new Vue({
    data: {
        person: {
            age: 10
        }
    },
    watch: {
        person() {
            console.log("person发生了变化");
        }
    }
})
// 通过对象.属性的方法 并不会将该属性变为响应式数据，也不会触发watch中监听person的回调
// VM.person.name = '哈哈'
// 通过Vue实例的$set,可以为对象新增响应式属性，并触发watch中监听person的回调
VM.$set(VM.person, 'name', '哈哈')
VM.person.name='你好'

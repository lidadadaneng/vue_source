const {observe,defineReactive} = require('./defineReactive')
const {Watcher} = require('./watcher')

class Vue {
    constructor(options) {
        // 将配置项挂在到Vue实例上
        this.$options = options
        this._data = options.data
        // 通过initData完成data初始化(将data属性挂载在到Vue实例上)
        this.initData()
        // 8.4 无论是计算属性的初始化还是data的初始化都必须放到watch初始化之前，因为计算属性和data的初始化完成 watch才能侦测到它们。
        this.initComputed()
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
    // 8.3 对计算属性单独初始化
    initComputed() {
        const computeds = this.$options.computed
        if (computeds) {
            const keys = Object.keys(computeds)
            for (let index = 0; index < keys.length; index++) {
                // 8.5 第二个参数传入计算属性函数
                // 8.15 计算属性初始化的watcher  需要将其标记为惰性的
                const watcher = new Watcher(this,  computeds[keys[index]],function() { },{lazy:true})
                // 8.6 将该watcher挂载到Vue实例上
                Object.defineProperty(this,keys[index],{
                    enumerable: true,
                    configurable: true,
                    // 8.7 不允许用户修改计算属性
                    set:function computedSetter() {
                        console.warn("请不要修改计算属性")
                    },
                    // 8.8 通过watcher的get方法求值，并将求值结果返回出去
                    get:function computedGetter() {
                        // 8.9 只有watcher为脏数据时，再重新求值
                        if(watcher.dirty) {
                            watcher.get()
                            // 8.10 求出新值 更新dirty状态
                            watcher.dirty = false
                        }
                        return watcher.value
                    }
                })
            }
        }
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
VM.person.name = '哈哈'
// 通过Vue实例的$set,可以为对象新增响应式属性，并触发watch中监听person的回调
VM.$set(VM.person, 'name', '哈哈')
VM.person.name='你好'

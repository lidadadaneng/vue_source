// 1、 observe函数：判断数据类型，新建Observer实例
function observe(data) {
    // 1.1 如果被观测的data为基本数据类型 就返回
    const type = Object.prototype.toString.call(data)
    if (type !== '[object Object]' && (type !== '[object Array]')) return
    // 1.2 观测数据涉及一些复杂的逻辑 将这个过程封装为一个Observer类
    // 6.3 将Observer实例 return出去，并在defineReactive中接收。
    if(data.__ob__) return data.__ob__
    new Observer(data)
}
// 2、Observer类：用来观测数据、生成负责处理依赖的Dep实例等复杂逻辑
class Observer {
    constructor(data) {
        // 6.1 为observer实例挂一个Dep实例（事件中心）
        this.dep = new Dep()

        // 7.5 数组不能调用walk，因为walk会通过defineProperty劫持下标会出现依赖回调错乱等问题
        if(Array.isArray(data)) {
            // 7.6 用我们改造好的数组原型覆盖 自身的原型对象
            data.__proto__ = ArrayMethods
            // 7.7 将数组所有子元素变为响应式
            this.observeArray(data)
        }else {
            // 2.1 将data所有属性 变为响应式
            this.walk(data)
        }
        // 6.2 将observer实例挂在到不可枚举的属性__ob__上,供外部$set使用
        Object.defineProperty(data, "__ob__", {
            value: this,
            enumerable: false,
            configurable: true,
            writable: true
        })

    }
    walk(data) {
        let keys = Object.keys(data)
        // 2.1 将initData中，劫持数据的操作放到此处
        //     遍历data，劫持传入data的所有属性
        for (let i= 0; i<keys.length; i++) {
            defineReactive(data,keys[i],data[keys[i]])
        }
    }

    // 7.8 将传入的数组的所有子元素 变为响应式
    observeArray(arr) {
        for (let i = 0; i < arr.length; i++) {
            observe(arr[i])
        }
    }
}

// 7.0 获取数组原型对象
const ArrayMethods = {}
ArrayMethods.__proto__ = Array.prototype
// 7.1 声明需要被改造的数组方法 这里举两个例子
const methods = ['push','pop']
// 7.2 对数组方法进行改造
methods.forEach(method=>{
    ArrayMethods[method] = function (...args) {
        const oldValue = [...this]
        // 7.3 传入参数执行原本方法
        const result = Array.prototype[method].apply(this,args)
        // 7.4 派发依赖更新
        this.__ob__.dep.notify(oldValue,this)
        return result
    }
})

// 3、defineReactive工具函数：用来递归劫持data，将data数据变为响应式数据
function defineReactive(object, key, value) {
    // 3.1、递归调用defineReactive来递归劫持深层次data数据   defineReactive--observe--Observer--defineReactive
    // 6.4 接收Observer实例，为属性Dep收集依赖 Watcher
    let childOb = observe(object[key])
    // 4.0、为每个data数据新建一个Dep实例，并通过闭包维护
    let dep = new Dep()
    // 3.2、数据劫持
    Object.defineProperty(object, key, {
        enumerable: true,
        configurable: true,
        // 注意：不要在object属性的setter/getter中 通过object访问这个属性否则会陷入死循环
        set: function reactiveSetter(newVal) {
            if (newVal === value) return // 与原来值相同 终止逻辑
            // 4.4、Dep派发依赖更新
            dep.notify(newVal,value)
            console.log(`${key}被赋予了新值--${newVal}`)
            // 数据更新 在此处可做视图更新操作
            value = newVal
        },
        get: function reactiveGetter() {
            console.log(`获取${key}的值`)
            // 4.5、Dep收集依赖
            dep.depend()
            // 6.5 observe函数 如果传入数据为简单数据类型 就不会返回Observer实例 所以需要判断一下是否有Observer实例，如果有就为Observer实例的Dep也收集一份 依赖
            if(childOb) childOb.dep.depend()
            return value
        }
    })
}
// 4、Dep抽象类：负责收集依赖、通知依赖更新等
class Dep {
    // 4.1、subs用来保存所有订阅者
    constructor(option) { this.subs = []}
    // 4.2、depend方法用来收集订阅者依赖
    depend() {
        // 5.5、如果为Watcher实例初始化
        if (Dep.target) {
            // 5.6、 每个data数据Watcher实例化，都会先设置Dep.target并触发data数据得getter，完成依赖得收集
            this.subs.push(Dep.target)
        }
    }
    // 4.3、notify方法用来派发订阅者更新
    notify(newVal,value) {
        // 8.12 依赖更新派发更新时 先走update判断是否要更新
        this.subs.forEach(watcher => watcher.update(newVal, value))
    }
}
exports.observe = observe
exports.defineReactive = defineReactive
exports.Dep = Dep

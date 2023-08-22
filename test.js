const person = {}
let initName = '哥哥'
Object.defineProperty(person,"name",{
    get() {
        return initName
    },
    set(newVal) {
        initName = newVal
    }
})
console.log(person.name)   // '哥哥'
person.name = '弟弟'
console.log(person.name,initName)   // '弟弟' '弟弟'

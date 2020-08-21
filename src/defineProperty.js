// 数据响应化
function defineReactive(obj, key, val) {

    // val为对象递归处理
    observe(val)

    Object.defineProperty(obj, key, {
        get() {
            console.log('get:', key, val)
            return val
        },
        set(newVal) {
            if(newVal !== val) {
                console.log('set:', key, val)
                // val 为对象，递归处理
                observe(val)
                val = newVal
            }
        }
    })
}


// 使得对象内所有属性都被拦截
function observe(obj) {
    if(typeof obj !=='object' || obj == null) {
        return 
    }

    Object.keys(obj).forEach(key => {
        defineReactive(obj, key, obj[key])
    })
}

// 由于新增的属性无法拦截 所以必须有特定的api做对应的响应式拦截
function set(obj, key, val) {
    defineReactive(obj, key, val)
}

const obj = { 'bar': 5 }

observe(obj)

// defineReactive(obj, 'foo', 'foo')

obj.bar
obj.bar = '7'
obj.bar = { a: 100 }
set(obj, 'bar', 7)

// 数据响应化
function defineReactive(obj, key, val) {

    // 递归处理
    observe(val)

    // 每执行一次defineReactive就会创建一个Dep实例
    const dep = new dep()

    Object.defineProperty(obj, key, {
        get() {
            console.log('get:', key)

            // 依赖收集 把watcher和dep关联
            Dep.target && dep.addDep(Dep.target)
            return val
        },
        set(newVal) {
            if(newVal !== val) {
                console.log('set:', key, newVal)
                observe(obj)
                val = newVal

                // 通知更新
                dep.notify()
            }
        }
    })
}


// 使得每一个对象所有的属性都被拦截
function observe(obj) {
    if(typeof obj !== 'object' || obj == null) {
        return
    }

    // 创建Observer实例，以后出现一个对象，就会有一个Observer实例
    new Observer(obj)
}

// 代理data中的数据

function proxy(vm) {
    Object.keys(vm.$data).forEach(key => {
        Object.defineProperty(vm, key, {
            get() {
                return vm.$data[key]
            },
            set(v) {
                vm.$data[key] = v
            }
        })
    })
}

// 响应式操作
class FVue {
    constructor(options) {
        // 保存选项
        this.$options = options
        this.$data = options.$data

        // 响应化处理
        observe(this.$data)

        // 代理 将$data中的key代理到FVue实例上
        proxy(this)

        //编译
        new Compiler('#app', this)
    }
}

// 做数据响应化 每一个响应式对象就伴生一个Observer实例
class Observer {
    constructor(value) {
        this.value = value

        // 判断value是对象还是数组
        this.walk(value)
    }

    // 遍历对象做响应式
    walk(obj) {
        Object.keys(obj).forEach(key => {
            defineReactive(obj, key, obj[key])
        })
    }
}

// 编译过程 解析模板 找到依赖并和前面的属性关联起来
class Compiler {
    constructor(el, vm) {
        this.$vm = vm
        this.$el = document.querySelector(el)

        // 执行编译
        if(this.$el) {
            this.compile(this.$el)
        }
    }

    // 接收根节点
    compile(el) {
        // 遍历这个el 获取所有子节点
        el.childNodes.forEach(node => {
            // 是否是元素
            if (this.isElement(node)) {
                this.compileElement(node)
            } else if (this.isInner(node)) {
                // 是否是插值表达式
                this.compileText(node)
            }

            // 递归
            if (node.childNodes) {
                this.compile(node)
            }
        })
    }

    // 判断节点是否是元素
    isElement(node) {
        return node.nodeType === 1
    }

    // 解析绑定表达式{{}}
    compileText(node) {
        // 获取正则匹配表达式 从vm里面拿出它的值
        node.textContent = this.$vm[RegExp.$1]
    }

    // 编译元素
    compileElement(node) {
        // 处理元素上面的属性 典型的是f- @ 开头
        const attrs = node.attributes
        Array.from(attrs).forEach(attr => {
            const attrName = attr.name 
            const exp = attr.value
            if (attrName.indesOf('f-') === 0) {
                // 截取指令名称 text
                const dir = attrName.substring(2)
                // 判断是否存在对应的方法 有则执行
                this[dir] && this[dir](node, exp)
            }
        })
    }

    // f-text
    text(node, exp) {
        node.textContent = this.$vm[exp]
    }

    // f-html
    html(node, exp) {
        node.innerHtml = this.$vm[exp]
    }

    // 所有动态绑定都需要创建更新函数以及对应的watcher实例
    // 动态绑定都要做两件事 首先解析动态值 其次创建更新函数
    // 如果对应的exp的值发生变化，执行这个watcher的更新函数

    update(node, exp, dir) {
        // 初始化
        const fn = this[dir + 'Updater']
        fn && fn(node, this.$vm[exp])

        // 更新 创建一个Watcher实例
        new Watcher(this.$vm, exp, val => {
            fn && fn(node, val)
        })
    }

    textUpdater(node, val) {
        node.textContent = val
    }

    htmlUpdater(node, val) {
        node.innerHtml = val
    }

    // 文本节点 判断节点是否是插值表达式
    isInner(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
}


// 管理一个依赖
class Watcher{
    constructor(vm, key, updateFn) {
        this.vm = vm
        this.key = key
        this.updateFn = updateFn
        
        // 获取当前key 触发依赖收集 defineReactive中的get
        Dep.target = this
        vm[key]
        Dep.target = null
    }

    // 未来会被dep调用
    update() {
        // 传入当前的最新值给更新函数
        this.updateFn.call(this.vm, this.vm[this.key])
    }
}


// Dep 保存所有watcher实例 当某个key 发生变化 通知它们执行更新
class Dep {
    constructor() {
        this.deps = []
    }

    addDep(watcher) {
        this.deps.push(watcher)
    }

    notity() {
        this.deps.forEach(dep => dep.update())
    }
}
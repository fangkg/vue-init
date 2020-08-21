# vue-init
MVVM框架三要素： 数据响应式、模板引擎、模板引擎渲染
数据响应式：监听数据变化并在视图中更新
    Object.defineProperty() 实现变更检查
    Proxy
模板引擎：提供描述视图的模板语法
    插值： {{}}
    指令： v-bind v-on v-model v-for v-if
渲染：如何将模板转换成html
    模板 => vdom => dom

新建Vue实例原理分析
1、new Vue()首先执行初始化，对data执行响应化处理，这个过程发生在Observer中 判断是对象还是数组
2、同时对模板进行编译，找到其中动态绑定的数据，从data中获取并初始化视图，这个过程发生在Compile中 编译模板 依赖收集
3、同时定义一个更新函数和Watcher，将来对应数据变化时Watcher会调用更新函数 
4、由于data的某个key在一个视图中可能出现多次，所以每个key都需要一个管家Dep来管理多个Watcher
5、将来data中数据一旦发生变化，会首先找到对应的Dep,通知所有Watcher执行更新函数


实例：
1、执行初始化，对data执行响应化处理
2、编译 compile 编译模板中vue模板特殊语法，初始化视图、更新视图
3、依赖收集： 视图中会用到data中某个key，这个现象称为依赖。同一个key可能多次出现，每次都需要收集出来用一个Watcher来维护他们，这个过程称为依赖收集。多个Watcher需要一个Dep来管理，需要更新时由Dep统一通知。
依赖收集实现思路：
    1.1 defineReactive时每一个key创建一个Dep实例
    1.2 初始化视图时读取某个key,例如name, 创建一个watcher1
    1.3 由于触发name1的getter方法，便将watcher1添加到name1的Dep中
    1.4 当name更新，setter触发更新时，便可通过对应Dep通知其管理所有Watcher更新
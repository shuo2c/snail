class Dep {
    constructor(){
        this.sub = []
    }

    addSub(watcher){
        this.sub.push(watcher)
    }


    notify(){
        this.sub.forEach((watcher)=>{
            watcher.update()
        })
    }
}


class Watcher {
    constructor(vm, key, cb){
        this.cb = cb
        this.vm = vm
        this.key = key

        Dep.target = this
        key.split('.').reduce((nwObject, k)=>nwObject[k], vm)
        Dep.target = null
    }


    update(){
        this.cb(this.key.split('.').reduce((nwObject, k)=>nwObject[k], vm))
    }
}

class Vue {
    constructor(Options){
        this.$data = Options.data
        
        
        // 调用数据劫持方法
        Observe(this.$data)

        // 属性代理
        Object.keys(this.$data).forEach((itemKey)=>{
            Object.defineProperty(this, itemKey, {
                enumerable: true,
                configurable: true,
                get(){
                    return this.$data[itemKey]
                },
                set(newValue){
                    this.$data[itemKey] = newValue
                }
            })
        })

        // 文档碎片
        compile(Options.el, this)
    }
   
}   



// 定义拦截
function Observe(obj){
    if(!obj || typeof obj != 'object') return
    const dep = new Dep()
    Object.keys(obj).forEach((itemKey)=>{
        let value = obj[itemKey]
        Observe(value)
        Object.defineProperty(obj, itemKey, {
            enumerable:true,
            configurable:true,
            get(){
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set(newValue){
                value = newValue
                Observe(value)
                dep.notify()
            }
        })
    })   
}


// 定义文档碎片
function compile(el, vm){
    vm.$el = document.querySelector(el)
    const fragment = document.createDocumentFragment()
    while(childNode = vm.$el.firstChild){
        fragment.append(childNode)
    }
    

    // 替换数据
    replaceDomTemplate(fragment)
    
    // 拼接最后结果
    vm.$el.appendChild(fragment)
    

    function replaceDomTemplate(node){
        const pattern = /\{\{\s*(\S+)\s*\}\}/

        //console.log(pattern.exec(fragment))
        if(node.nodeType === 3) {
            const text = node.textContent
            const patternResult = pattern.exec(text)
            if(patternResult){
                const value = patternResult[1].split('.').reduce((newObj, itemKey)=>{ 
                    return newObj[itemKey] 
                }, vm)
                node.textContent = text.replace(pattern, value)

                new Watcher(vm, patternResult[1], (newValue)=>{
                    node.textContent = text.replace(pattern, newValue)
                })
            }
            
            // 终结循环
            return
        }


        // 判断当前节点是否为input输入框
        if(node.nodeType ===1 && node.tagName.toUpperCase() === 'INPUT') {
            const attrs = Array.from(node.attributes)
            const findResult = attrs.find((x)=>{ return x.name ==='v-model'})
            if(findResult){
                const expStr = findResult.value
                const value = expStr.split('.').reduce((newObj, k)=>newObj[k], vm)
                node.value = value

                new Watcher(vm, expStr, (newValue)=>{
                    node.value = newValue
                })

                // 添加监听事件
                node.addEventListener('input',(e)=>{
                    const keyArr = expStr.split('.')
                    const obj = keyArr.slice(0, keyArr.length -1).reduce((newObj, k)=>newObj[k], vm)
                    obj[keyArr[keyArr.length-1]] = e.target.value
                })
            }
        }

        // 递归
        node.childNodes.forEach((child)=>{replaceDomTemplate(child)})
    }
}



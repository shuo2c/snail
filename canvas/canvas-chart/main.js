import Element from "./element.js";

// js方式创建canvas 添加api支持
function createCanvas(el, canvasIdent){
    const canvasContainer = document.getElementsByClassName(el)[0]
    const canvas = document.createElement('canvas')
    canvas.setAttribute('id', canvasIdent)
    canvas.width = canvasContainer.scrollWidth
    canvas.height = canvasContainer.scrollHeight
    canvasContainer.append(canvas)
    const context = canvas.getContext('2d')

    return {context, canvas}
}


/**
 * 获取最大的层级值，同时标记每层要素的层级值，方便后续计算虚拟节点使用
 * @param {*} data // 原数据
 * @returns 
 */
function getMaxLevel(data) {
    let maxLevel = 0;
    
    // 定义循环函数 
    function cal(itemData, level) {
      if (level > maxLevel) {
        maxLevel = level;
      }
      itemData.forEach(node => {
        // 添加层级标识
        node.topo_level = level;
        if (node.children && node.children.length) {
          cal(node.children, level + 1);
        }
      })
    }
  
    const  initialData =  Array.isArray(data)? data: [data]
    cal(initialData, 0);
    return maxLevel;
  }
  
  /**
   *  获取每个节点作为根节点，向下延申到最底层的个数，若该节点的最底层不是最低点，则每次循环+1虚拟节点，便于底层原理计算，但并不绘制
   * 原理是循环到最下层的Element对象，每个Element元素向上汇报计算+1
   * @param {*} data 
   */
  function getDataNodeNum(data) {
    let maxLevel = getMaxLevel(data);
  
    function count(itemData, level, parents = []) {
      itemData.forEach(node => {
        if (Number.isNaN(node.chiCount) || node.chiCount === undefined) {
          node.chiCount = 0;
        }
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
          // 此处添加parents时不可以使用push，否则将会导致部分parent重复
          count(node.children, level + 1, parents.concat([node]));
        } else if (level < maxLevel) {
          // 通过buildSelf标识自插入属性，该对象不创建Ele对象
          node.children.push({ children: [], level: level + 1, buildSelf: true });
          count(node.children, level + 1, parents.concat([node]));
        } else if (level === maxLevel) {
          for (let i = parents.length - 1; i >= 0; i--) {
            parents[i].chiCount++;
          }
        }
      })
    }
  
    const initialData =   Array.isArray(data)? data: [data]
    count(initialData, 0);
    return data;
  }


  // 定义节点展示区域的大小
  const CON = {

    WIDTH: 200, // Element元素的宽度
    HEIGHT: 200, // Element元素的高度
  
    MARGIN: 60, // 两个Element元素之间的间距
    OUTERHEIGHT: 800  // 每行Element的高度
  }


  /**
   * 将每个分支看作一组，计算每组的横纵坐标范围
   * @param {*} data 
   */
  function calRange(data) {
    let eleWidth = CON.WIDTH + CON.MARGIN;

    const startX = 0;
    const startY = 0;

    // function range(data, start) {
    //   data.forEach((node, i) => {
    //     node.yRange = [node.topo_level + startY, (node.topo_level + 1) * CON.OUTERHEIGHT + startY];
    //     if (node.children) {
    //       if (i === 0) {
    //         node.xRange = [start, start + eleWidth * (node.chiCount === 0 ? 1 : node.chiCount)];
    //         range(node.children, start);
    //       } else {
    //         node.xRange = [data[i - 1].xRange[1], data[i - 1].xRange[1] + eleWidth * (node.chiCount === 0 ? 1 :node.chiCount)];
    //         range(node.children, data[i - 1].xRange[1]);
    //       }
    //     }
    //   });
    // }

    function range(data, start) {
      data.forEach((node, i) => {
        node.xRange = [node.topo_level + startX, (node.topo_level + 1) * CON.OUTERHEIGHT + startX];
        if (node.children) {
          if (i === 0) {
            node.yRange = [start, start + eleWidth * (node.chiCount === 0 ? 1 : node.chiCount)];
            range(node.children, start);
          } else {
            node.yRange = [data[i - 1].yRange[1], data[i - 1].yRange[1] + eleWidth * (node.chiCount === 0 ? 1 :node.chiCount)];
            range(node.children, data[i - 1].yRange[1]);
          }
        }
      });
    }

    const initialDate = Array.isArray(data)? data:[data]
    range(initialDate, startX);
    return data;
  }


// 初始化函数
function init({data, el, canvasIdent}){
    const {context, canvas} = createCanvas(el, canvasIdent)

    // clone 原有数据
    const cloneData = JSON.parse(JSON.stringify(data))

    // 获取每个节点作为根节点，向下延申到最底层的个数
    const numData = getDataNodeNum(cloneData);

    // 计算每个节点的横纵坐标范围
    const rangeData = calRange(numData);
    
    // 创建要素集
    data = new Element(rangeData, context); 

    context.clearRect(0, 0, 1800, 1800);
    
    data.draw();
}


export default { init }
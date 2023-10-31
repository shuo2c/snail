// 画布信息
const CANVASINFO = {};

import Element from './element.js';

const CON = {

  WIDTH: 200, // Element元素的宽度
  HEIGHT: 200, // Element元素的高度

  MARGIN: 800, // 两个Element元素的高度
  OUTERHEIGHT: 800  // 每行Element的高度
}

/**
 * 设置canvas对象，便于其他组件使用
 */
function setSanvas(canvas) {
  CANVASINFO.obj = canvas;
  CANVASINFO.context = canvas.getContext('2d');
  CANVASINFO.width = canvas.offsetWidth;
  CANVASINFO.height = canvas.offsetHeight;
}

/**
 * 获取canvas对象
 */
function getCanvas() {
  return CANVASINFO.obj;
}

function getContext() {
  return CANVASINFO.context;
}

/**
 * 获取UUID
 * @returns 
 */
function guid(prefix) {
  return prefix + '_xxxx-xxxx-yxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
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
    itemData.forEach(e => {
      // 添加层级标识
      e.topo_level = level;
      if (e.children && e.children.length) {
        cal(e.children, level + 1);
      }
    })
  }

  const  initialData =  Array.isArray(data)? data: [data]
  cal(initialData, 0);
  return maxLevel;
}

/**
 * 计算每个节点包含的所有最大层级的子和孙子节点的个数
 * 原理是循环到最下层的Element对象，每个Element元素向上汇报计算+1
 * @param {*} data 
 */
function countNum(data) {
  let maxLevel = getMaxLevel(data);

  function count(itemData, level, parents = []) {
    itemData.forEach(e => {
      if (Number.isNaN(e.chiCount) || e.chiCount === undefined) {
        e.chiCount = 0;
      }
      if (e.children && e.children.length) {
        // 此处添加parents时不可以使用push，否则将会导致部分parent重复
        count(e.children, level + 1, parents.concat([e]));
      } else if (level < maxLevel) {
        // 通过buildSelf标识自插入属性，该对象不创建Ele对象
        e.children.push({ children: [], level: level + 1, buildSelf: true });
        count(e.children, level + 1, parents.concat([e]));
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

/**
 * 将每个分支看作一组，计算每组的横纵坐标范围
 * @param {*} data 
 */
function calRange(data) {
  let eleWidth = CON.WIDTH + CON.MARGIN;

  const startX = 0;
  const startY = 0;

  function range(src, start) {
    src.forEach((e, i) => {
      e.yRange = [e.topo_level + startY, (e.topo_level + 1) * CON.OUTERHEIGHT + startY];
      if (e.children) {
        if (i === 0) {
          e.xRange = [start, start + eleWidth * (e.chiCount === 0 ? 1 : e.chiCount)];
          range(e.children, start);
        } else {
          e.xRange = [src[i - 1].xRange[1], src[i - 1].xRange[1] + eleWidth * (e.chiCount === 0 ? 1 :e.chiCount)];
          range(e.children, src[i - 1].xRange[1]);
        }
      }
    });
  }

  const initialDate = Array.isArray(data)? data:[data]
  range(initialDate, startX);
  return data;
}

/**
 * 获取无子节点的Element
 */
function flatElement(data) {
  const arr = [];

  function flat(src) {
    if (!src.group || src.group.children.length === 0) {
      arr.push(src);
    } else {
      src.group.children.forEach(e => flat(e));
    }
  }
  flat(data);
  return arr;
}

/**
 * 克隆数据
 * @param {*} data 
 * @returns 
 */
function clone(data) {
  return JSON.parse(JSON.stringify(data));
}


export default {
  CON,
  setSanvas,
  getCanvas,
  getContext,
  guid,
  clone,
  countNum,
  calRange,
  flatElement,
};
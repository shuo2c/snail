
import util from "./util.js";
import Element from "./element.js";

let data = [];
let arrows = [];

// 初始化函数
function init(options) {
  util.setSanvas(document.getElementById(options.id));

  addEvent();

  // 克隆数据，避免数据污染
  const cloneData = util.clone(options.data);

  // 计算每个父节点包含的所有子和孙节点数据个数
  const numData = util.countNum(cloneData);
  console.log(numData, 'numData')

  // 计算每个节点的横纵坐标范围
  const rangeData = util.calRange(numData);

  // 创建要素集
  data = new Element(rangeData);

  redraw();
}


/**
 * 重新绘制
 */
function redraw() {
  const ctx = util.getContext();
  ctx.clearRect(0, 0, 1800, 800);
  
  // arrows.forEach(e => e.draw()); // 无用代码

  data.draw();
}

// 添加点击事件
function addEvent() {
  let initWidth = 1800;
  let initHeight = 800;
  let init = 1;
  const beta = 0.1;

  const dom = util.getCanvas();
  const ctx = util.getContext();

  let startPos = [0, 0];
  let down = false;
  let lastPos = [0, 0];

  /**
   * 点击事件，计算合并或者展开
   * @param {*} event 
   */
  dom.onclick = (event) => {
    
    const clickX = event.offsetX;
    const clickY = event.offsetY;
    console.log(clickX, clickY, '??????')
    let selectEle = null;

    function getEle(e) {
      const upX = e.center[0];
      const upY =  e.center[1] + e.height / 2;
      if (Math.pow(clickX - upX, 2) + Math.pow(clickY - upY, 2) < 10) {
        selectEle = e;
      }
      if (!selectEle && e.group && e.group.children.length) {
        e.group.children.forEach(e => {
          getEle(e);
        })
      }
    }

    getEle(data);

    if (selectEle) {
      if (selectEle.openFlag) {
        selectEle.openFlag = false;
        selectEle.group.children = selectEle.srcChildren;
        selectEle.group.arrows = selectEle.srcArrows;

        delete selectEle.srcArrows;
        delete selectEle.srcChildren;
      } else {
        selectEle.openFlag = true;
        selectEle.srcChildren = selectEle.group.children;
        selectEle.srcArrows = selectEle.group.arrows;
        
        selectEle.group.children = [];
        selectEle.group.arrows = [];
      }
     
      redraw();
    }
  }

}

export default { init }
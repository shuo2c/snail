import Element  from "./element.js";
import Arrow from "./arrow.js";
import util from "./util.js";

/**
 * 组类
 * 用于存储子节点和子节点的箭头对象
 */
export default class Group {
  constructor(options) {
    this.id = options.id || util.guid('group');

    this.ctx = options.parent.ctx
    
    // 是否需要绘制组边框
    this.needBorder = options.needBorder || false;
    
    // 当前组所有子和孙节点的个数
    this.chiCount = options.chiCount;

    // 组下的子元素以及箭头
    this.createObject(options.children, options.parent);

    // 计算中心点
    this.center = this.getCenter();

    // 计算坐标点信息
    this.coordinates = this.getCoordinate();
  }

  /**
   * 根据子元素获取子元素最大最小中心坐标用于计算Group的中心坐标和边框
   * @returns 
   */
  getMaxMin() {
    const coordX = [];
    const coordY = [];
    this.children.forEach(e => {
      coordX.push(e.center[0]);
      coordY.push(e.center[1]);
    })

    const maxX = Math.max(...coordX);
    const minX = Math.min(...coordX);
    const maxY = Math.max(...coordY);
    const minY = Math.min(...coordY);
    return { maxX, minX, maxY, minY };
  }

  /**
   * 获取要素的中心点
   */
  getCenter() {
    const maxMin = this.getMaxMin();
    return [(maxMin.maxX + maxMin.minX) / 2, (maxMin.maxY + maxMin.minY) / 2];
  }

  /**
   * 获取坐标信息
   * @returns 
   */
  getCoordinate() {
    const maxMin = this.getMaxMin();

    const maxX = maxMin.maxX;
    const minX = maxMin.minX;
    const maxY = maxMin.maxY;
    const minY = maxMin.minY;

    const width = util.CON.WIDTH / 2;
    const height = util.CON.HEIGHT / 2;
    const margin = util.CON.MARGIN / 3;
    const betaLong = (maxX - minX + width * 2) / 2;
    const betaHeight = (maxY - minY + height * 2) / 2;

    return [
      [-betaLong - margin, -betaHeight - margin],
      [betaLong + margin, -betaHeight - margin],
      [betaLong + margin, betaHeight + margin],
      [-betaLong - margin, betaHeight + margin],
    ]
  }

  /**
   * 创建子对象，包括Element和Arrow对象
   * @param {*} children 
   * @param {*} parent 
   */
  createObject(children, parent) {
    const arrows = [];
    const child = [];
    children.forEach(e => {
      if (!e.buildSelf) {
        const ele = new Element(e, this.ctx);
        child.push(ele);
        arrows.push(new Arrow(e, parent, ele));
      }
    })
    this.arrows = arrows;
    this.children = child;
  }

  /**
   * 主要绘制边框等信息内容
   */
  draw() {
    this.children.forEach(e => e.draw());
    this.arrows.forEach(e => e.draw());

    // this.drawBorder();
  }

  /**
   * 绘制边框
   * @returns 
   */
  drawBorder() {
    if (this.children.length === 0 || !this.needBorder) {
      return;
    }
    const radius = 10;
    const coor = this.coordinates;
    const ctx = this.ctx

    ctx.save();
    ctx.translate(this.center[0], this.center[1]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#99745e';
    
    ctx.beginPath();
    ctx.arc(coor[0][0] + radius, coor[0][1] + radius, radius, Math.PI, Math.PI * 3 / 2);
    ctx.lineTo(coor[1][0] -radius, coor[1][1]);
    ctx.arc(coor[1][0] - radius, coor[0][1] + radius, radius, -Math.PI / 2, 0);
    ctx.lineTo(coor[2][0], coor[2][1] - radius);
    ctx.arc(coor[2][0] - radius, coor[2][1] - radius, radius, 0, Math.PI / 2);
    ctx.lineTo(coor[3][0] + radius, coor[3][1]);
    ctx.arc(coor[3][0] + radius, coor[3][1] - radius, radius, Math.PI / 2, Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}
import util from "./util.js";

/**
 * 箭头类
 * 主要通过箭头的起始要素和终点要素，以此来计算起点位置箭头的角度偏移量和方向
 */
export default class Arrow {
  constructor(options, fromEle, toEle) {
    this.id = options.id || util.guid('arrow');
    // 箭头起始要素
    this.from = fromEle;
    // 箭头结束要素
    this.to = toEle;
    // 箭头坐标信息
    this.coordinates = this.getCoordinate();
  }

  /**
   * 获取坐标信息
   * @returns 
   */
  getCoordinate() {
    const fromC = this.from.center;
    const toC = this.to.center;
    return [
      [fromC[0], fromC[1] + this.from.height / 2],
      [toC[0], toC[1] - (toC[1] - fromC[1]) / 2],
      [toC[0], toC[1] - this.to.height / 2]
    ]
  }

  /**
   * 主要绘制边框等信息内容
   */
  draw() {
    const coor = this.coordinates;
    const ctx = util.getContext();
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#558dbd';

    ctx.setLineDash([5, 2]);
    ctx.beginPath();
    ctx.moveTo(coor[0][0], coor[0][1]);
    ctx.lineTo(coor[1][0], coor[1][1]);
    ctx.lineTo(coor[2][0], coor[2][1]);
    ctx.stroke();
    ctx.restore();
    this.drawArrow(ctx, coor[2]);
  }

  /**
   * 绘制箭头
   * @param {*} ctx 
   * @param {*} points 
   */
  drawArrow(ctx, points) {
    const angle = Math.PI * 20 / 180;
    const height = 12;
    
    ctx.save();

    ctx.lineWidth = 1;
    ctx.fillStyle = '#558dbd';
    ctx.translate(points[0], points[1]);
    ctx.beginPath();
    ctx.lineTo(0, 0);
    ctx.lineTo(Math.tan(angle) * height, -height);
    ctx.arc(0, -height * 1.5, height * 0.6, Math.PI / 2 - Math.PI / 4.8, Math.PI / 2 + Math.PI / 4.8);
    ctx.lineTo(-Math.tan(angle) * height, -height);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
}
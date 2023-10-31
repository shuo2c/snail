/**
 * 元素，包含元素的样式属性以及绘制范围等信息
 * 每个要素所有的子元素都被包含在Group要素中
 */
import util from "./util.js";
import Group from './group.js';

export default class Element {
  constructor(options, context) {
    // 横向文字距边框宽度
    this.rowPadding = 10;
    // 纵向文字距边框宽度
    this.coloumnPadding = 5;
    // 元素外边距
    this.margin = util.CON.MARGIN;

    this.fontSize = 20;

    this.width = util.CON.WIDTH;

    this.height = util.CON.HEIGHT;

    // 名称，可随机
    this.name = options.name;

    // ID值 可随机
    this.id = options.id || util.guid('element');
    
    // 显示文本内容
    this.text = options.text;

    // 所有子和孙辈数据个数
    this.chiCount = 0;

    // 标识该要素展开还是收缩的
    this.openFlag = false;

    // 元素的中心位置
    this.center = this.getCenter(options.xRange, options.yRange);

    this.coordinates = this.getCoordinate();

    this.ctx = context

    this.group = this.creat(options.children || [], options.needBorder);

    // // 收缩框数据集
    // this.shrink = options.shrink;
    
  }

  /**
   * 获取要素的中心点
   * @param {*} xRange 
   * @param {*} yRange 
   */
  getCenter(xRange, yRange) {
    return [(xRange[1] - xRange[0]) / 2 + xRange[0], (yRange[1] - yRange[0]) / 2 + yRange[0]];
  }

  /**
   * 根据圆心以及边框宽高获取圆心
   * 规则为 [左上， 右上，右下，左下，左上]
   */
  getCoordinate() {
    return [
      [-this.width / 2, -this.height / 2],
      [this.width / 2, -this.height / 2],
      [this.width / 2, this.height / 2],
      [-this.width / 2, this.height / 2]
    ]
  }

  /**
   * 绘制矩形边框，包含圆角
   */
  draw() {
    const ctx = this.ctx
    const radius = 4;
    const coor = this.coordinates;
    
    ctx.save();
    ctx.translate(this.center[0], this.center[1]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#558dbd';
    ctx.fillStyle = '#f6fafd';
    ctx.shadowColor = '#a9d4f5';
    ctx.shadowBlur = 5;
    
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
    ctx.fill();
    ctx.restore();

    if (this.group) {
      this.group.draw();
    }
    
    this.drawText();
    this.drawCircle();
  }

  /**
   * 绘制文本内容
   */
  drawText() {
    const ctx = this.ctx
    ctx.save();
    ctx.translate(this.center[0], this.center[1]);
    ctx.font = this.fontSize + 'px serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('node', 0, 0 + this.fontSize / 3, this.width - this.rowPadding * 2);
    ctx.restore();
  }

  /**
   * 绘制圆圈
   */
  drawCircle() {
    const circleRadius = 6;
    const ctx = this.ctx
    ctx.save();
    ctx.strokeStyle = '#16ade7';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#fff';
    ctx.translate(this.center[0], this.center[1]);
    
    if (this.group.children.length || this.openFlag) {
      ctx.beginPath();
      ctx.arc(0 + this.width / 2, 0, circleRadius, 0, Math.PI * 2);
      ctx.closePath();
      // ctx.strokeStyle = '#f18585';
      if (this.openFlag) {
        // ctx.lineWidth = 1;
        // ctx.moveTo(0, -circleRadius + 2 + this.height / 2);
        // ctx.lineTo(0, circleRadius - 2 + this.height / 2);
        // ctx.moveTo(-circleRadius + 2, this.height / 2);
        // ctx.lineTo(circleRadius - 2, this.height / 2);
      } else {
        ctx.lineWidth = 1;
        ctx.moveTo(0 + this.width / 2 +(-circleRadius + 2) , 0);
        ctx.lineTo(0 + this.width / 2 + circleRadius - 2, 0);        
      }
      ctx.fill();
      ctx.stroke();
    }
    
    ctx.restore();
  }

  /**
   * 根据子元素生成对应的类
   */
  creat(children, needBorder) {
    return new Group({ children, needBorder, parent: this });
  }

  /**
   * 计算元素的宽和高，用于后续计算元素的位置
   */
  calWidthHeight() {
    const style = this.ctx.measureText('node');
    this.width = style.width + this.rowPadding * 2;
    this.height = this.fontSize + this.coloumnPadding * 2;
  }
}
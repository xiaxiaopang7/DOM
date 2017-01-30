/*
	现在Drag类可以发布事件，由事件绑定的方式来由使用者（客户）来给拖拽增加任意需要的效果。
	Drag其实已经足够灵活了。
	但是现在我还可以给Drag再内置一些功能
	问题是：
		既然可以由用户来自由灵活的扩展任何功能，那何必还要再内置其它功能呢？
	比如：
		1、给Drag类增加限定拖拽的功能
		2、给Drag类增加拖拽开始的时候加一个虚边框，拖拽结束的时候去掉虚边框的功能。
	这两个功能客户自已也可以实现，为什么还要内置在Drag类上呢？

*/

function EventEmitter(){
	
}
//scope,closure,context,pattern,module,modle,
EventEmitter.prototype.on=function(type,fn){
	if(!this["emitter"+type]){
		this["emitter"+type]=[];
	}
	var a=this["emitter"+type];
	for(var i=0;i<a.length;i++){
		if(a[i]==fn)return this;	
	}
	a.push(fn);
	return this;
}
EventEmitter.prototype.run=function(type,e){
	var a=this["emitter"+type];
	if(a&&a.length){
		for(var i=0;i<a.length;i++){
			if(typeof a[i]=="function"){
				a[i].call(this,e);
			}else{
				a.splice(i,1);
				i--;
			}
		}
	}
}
EventEmitter.prototype.off=function(type,fn){
	var a=this["emitter"+type];
	if(a&&a.length){
		for(var i=0;i<a.length;i++){
			if(a[i]==fn){
				a[i]=null;
				break;	
			}
		}
	}
	return this;
}

function Drag(ele){
	this.x=null;
	this.y=null;
	this.mx=null;
	this.my=null;
	this.ele=ele;
	this.obj=ele;
	
	this.DOWN=processThis(this.down,this);
	this.MOVE=processThis(this.move,this);
	this.UP=processThis(this.up,this);
	on(this.ele,"mousedown",this.DOWN);//对于这个on来说，我们只是使用者
	//this.on;//对于这个on来说，我们是开发者，
	
}
Drag.prototype.__proto__=EventEmitter.prototype;//这是更安全的继承方法，一般在Node里都是采用这种方式实现继承。IE不支持

Drag.prototype=new EventEmitter;//相对这种方式来说，上边的写法更安全
Drag.prototype.down=function(e){
	this.x=this.ele.offsetLeft;
	this.y=this.ele.offsetTop;
	this.mx=e.pageX;
	this.my=e.pageY;
	if(this.ele.setCapture){
		this.ele.setCapture();
		on(this.ele,"mousemove",this.MOVE);
		on(this.ele,"mouseup",this.UP);
		this.on
	}else{
		on(document,"mousemove",this.MOVE);
		on(document,"mouseup",this.UP);
	}
	e.preventDefault();
	//IE7-->on--->ele["eventmousedown"][down]
	//mousedown触发--run--遍历ele["eventmousedown"]数组
	//在run里通过e=window.event得到事件对象，然后改造e，给它加了一堆的方法和属性，然后再通过a[i].call(this,e);传给down
	this.run("abcde1",e);
	
}
Drag.prototype.move=function(e){
	this.ele.style.left=this.x+(e.pageX-this.mx)+"px";
	this.ele.style.top=this.y+(e.pageY-this.my)+"px";
	this.run("abcde2",e);
}
Drag.prototype.up=function(e){
	if(this.ele.releaseCapture){
		this.ele.releaseCapture();
		off(this.ele,"mousemove",this.MOVE);
		off(this.ele,"mouseup",this.UP);
	}else{
		off(document,"mousemove",this.MOVE);
		off(document,"mouseup",this.UP);
	}
	//this.on("dragend",e);
	this.run("abcde3",e);
}

var oRange={l:0,r:600,t:0,b:300};
//相当于重新写了一个计算元素拖拽位置的方法，用这个方法，把原来的Drag.prototype.move覆盖掉
Drag.prototype.addRange=function(obj){
	this.oRange=obj;
	this.on("abcde2",this.range);
}
Drag.prototype.range=function range(e){
	var oRange=this.oRange;
	var l=oRange.l,r=oRange.r,t=oRange.t,b=oRange.b;
	var currentL=this.x+(e.pageX-this.mx);
	var currentT=this.y+(e.pageY-this.my);
	 
	if(currentL>=r){
		this.ele.style.left=r+"px";
	}else if(currentL<=l){
		this.ele.style.left=l+"px";
	}else{
		this.ele.style.left=currentL+"px";
	}
	
	if(currentT>=b){
		this.ele.style.top=b+"px";
	}else if(currentT<=t){
		this.ele.style.top=t+"px";
	}else{
		this.ele.style.top=currentT+"px";
	}
	
}
//var obj=new Drag(ele);
//obj.on("abcde2",range);
Drag.prototype.border=function(width,color,style){
	
	//允许不传参数，如果参数没有传，则这里给它指定默认的值
	if(!width)width="2";
	if(!color)color="#666";
	if(!style)style="dashed";
	this.borderStyle={width:width,color:color,style:style}
	this.on("abcde1",this.addBorder);
	this.on("abcde3",this.removeBorder);
}

Drag.prototype.addBorder=function(){
	//this.ele.style.border="2px dashed #666";
	var o=this.borderStyle;
	this.ele.style.border=o.width+"px "+o.color+" "+o.style;
}

Drag.prototype.removeBorder=function(){
	this.ele.style.border="none";
}
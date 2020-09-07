// =================================================
//
// gQuery v1.2.5 under strict (Only 6kb)
//
// Licensed MIT for open source use
// or gQuery Commercial License for commercial use
//
// Copyright 2020 Ganxiaozhe
//
// [fn]
// seletor,each,find,parent,remove,empty,text,html
// val,width,height,offset,prepend,append,before,after
// attr,removeAttr,hasClass,addClass,removeClass,toggleClass
// css,show,hide,fadeIn,fadeOut,fadeToggle
// slideUp,slideDown,slideToggle,on,trigger,click,select
//
// [extend fn]
// isArray,uniqueArray,bind,strToNode,copy,deepClone
// [extend array]
// unique
// [extend storage]
// read,write,remove,clearAll,push
//
// =================================================
;(function(global,factory){
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = window || self, global.gQuery = global.$ = factory());

	if(!!window.ActiveXObject || "ActiveXObject" in window){
		window.location.href = 'https://gquery.net/killie?app='+(navigator.appVersion || 'null');
	}

	console.log('%c gQuery %c https://gquery.net \n','color: #fff; background: #030307; padding:5px 0; margin-top: 1em;','background: #efefef; color: #333; padding:5px 0;');
}(window,function(){
	'use strict';
	var gQuery = function( selector, context ) {
		return new gQuery.fn.init( selector, context );
	}

	gQuery.fn = gQuery.prototype = {
		constructor: gQuery,
		gquery: '1.2.0',
		init: function(sel,opts){
			let to = typeof sel,elems = [];
			switch(to){
				case 'function':
					if (document.readyState != 'loading'){sel();} else {
						document.addEventListener('DOMContentLoaded', sel);
					}
					return;
				case 'object':
					sel.length===undefined ? elems.push(sel) : elems = sel;
					gQuery.isWindow(sel) && (elems = [window]);
					break;
				case 'string':elems = document.querySelectorAll(sel);break;
			}

			this.length = elems.length;
			for (let i = elems.length - 1; i >= 0; i--) {this[i] = elems[i];}
			return this;
		},
		each: function(arr,callback){
			callback || (callback = arr,arr = this);
			for(let i = 0; i < arr.length; i++){
				if(callback.call(arr[i], i, arr[i-1]) == false){break;}
			}
			return this;
		},
		find: function(sel){
			let finder = gQuery.deepClone(this),fArr = [];
			this.each(function(idx){
				let elems = this.querySelectorAll(sel);
				for (let i = elems.length - 1; i >= 0; i--) {fArr.push(elems[i]);}
			});

			fArr = gQuery.array.unique(fArr);
			finder.length = fArr.length;let ii = 0;
			for (let i = fArr.length - 1; i >= 0; i--) {finder[i] = fArr[ii];ii++;}
			return finder;
		},
		parent: function(){
			let _this = this;
			this.each(function(idx){_this[idx] = this.parentNode;});
			return this;
		},
		next: function(sel){
			let _this = this;
			this.each(function(idx){_this[idx] = this.nextElementSibling;});
			return this;
		},
		remove: function(){
			this.each(function(){this.parentNode.removeChild(this);});
		},
		empty: function(){
			this.each(function(){
				while(this.firstChild){this.removeChild(this.firstChild);}
			});
		},
		text: function(val){
			if(val === undefined) {
				let res = '';this.each(function(){res += this.innerText;});return res;
			} else {
				this.each(function(){this.innerText = val;});return this;
			}
		},
		html: function(val){
			if(val === undefined) {
				let res = '';this.each(function(){res += this.innerHTML;});return res;
			} else {
				this.each(function(){this.innerHTML = val;});return this;
			}
		},
		val: function(val){
			if(val === undefined) {
				let res = '';this.each(function(){
					res += (this.value===undefined ? '' : this.value);
				});return res;
			} else {
				this.each(function(){this.value = val;});return this;
			}
		},
		width: function(val){
			let totalWidth = 0;
			this.each(function(){
				val===undefined ? (totalWidth += this.offsetWidth) : (this.style.width = val);
			});
			if(val===undefined){return totalWidth/this.length;} else {return this;}
		},
		height: function(val){
			let totalHeight = 0;
			this.each(function(){
				val===undefined ? (totalHeight += this.offsetHeight) : (this.style.height = val);
			});
			if(val===undefined){return totalHeight/this.length;} else {return this;}
		},
		offset: function(){
			var rect = this[0].getBoundingClientRect();
			return {
				top: rect.top + document.body.scrollTop,
				left: rect.left + document.body.scrollLeft
			}
		},
		append: function(elem){
			elem = gQuery.strToNode(elem);
			this.each(function(){this.appendChild(elem);});return this;
		},
		prepend: function(elem){
			elem = gQuery.strToNode(elem);
			this.each(function(){this.prepend(elem);});return this;
		},
		before: function(elem){
			elem = gQuery.strToNode(elem);
			this.each(function(){this.before(elem);});return this;
		},
		after: function(elem){
			elem = gQuery.strToNode(elem);
			this.each(function(){this.after(elem);});return this;
		},
		attr: function(attr,val){
			if(val === undefined && typeof attr === 'string') {return this[0].getAttribute(attr);} else {
				if(typeof attr === 'object'){
					for(let idx in attr){
						this.each(function(){this.setAttribute(idx, attr[idx]);});
					}
					return this;
				}
				this.each(function(){this.setAttribute(attr, val);});return this;
			}
		},
		removeAttr: function(attr){
			this.each(function(){this.removeAttribute(attr);});return this;
		},
		hasClass: function(cls){
			let res = false;
			this.each(function(){
				if( this.classList.contains(cls) ){res = true;return false;}
			});
			return res;
		},
		addClass: function(cls){
			this.each(function(){this.classList.add(cls);});return this;
		},
		removeClass: function(cls){
			this.each(function(){this.classList.remove(cls);});return this;
		},
		toggleClass: function(cls){
			this.each(function(){this.classList.toggle(cls);});return this;
		},
		css: function(styles){
			if(typeof styles === 'string'){return this[0].style[styles];}

			this.each(function(){
				for(let style in styles){this.style[style] = styles[style];}
			});
			return this;
		},
		show: function(disp){
			disp || (disp='block');this.each(function(){this.style.display=disp});
			return this;
		},
		hide: function(){
			this.each(function(){this.style.display='none'});
			return this;
		},
		fadeIn: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			this.each(function(){
				if(this.style.display!='' && this.style.display!='none'){return true;}

				this.style.display='block';this.animate([{opacity:0},{opacity:1}],dur);
				let cthis = this;setTimeout(()=>{callback.call(cthis);},dur);
			});
			return this;
		},
		fadeOut: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			this.each(function(){
				this.animate([{opacity:0}],dur);

				let cthis = this;setTimeout(()=>{cthis.style.display = 'none';callback.call(cthis);},dur);
			});
			return this;
		},
		fadeToggle: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			this.each(function(){
				this.style.display=='none' ? $(this).fadeIn(dur,callback) : $(this).fadeOut(dur,callback);
			});
			return this;
		},
		slideUp: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			this.each(function(){
				this.animate([{height:this.offsetHeight+'px'},{height:'0px'}],dur);

				let cthis = this;setTimeout(()=>{cthis.style.display = 'none';callback.call(cthis);},dur);
			});
			return this;
		},
		slideDown: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			this.each(function(){
				this.style.display = '';let elH = this.offsetHeight+'px';
				this.animate([{height:'0px'},{height:elH}],dur);

				let cthis = this;setTimeout(()=>{callback.call(cthis);},dur);
			});
			return this;
		},
		slideToggle: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			this.each(function(){
				this.style.display=='none' ? $(this).slideDown(dur,callback) : $(this).slideUp(dur,callback);
			});
			return this;
		},
		on: function(evtName,fn){
			this.each(function(){gQuery.bind(this,evtName,fn);});return this;
		},
		trigger: function(evtName,params){
			params || (params={});let ctmEvent;

			if (window.CustomEvent) {
				ctmEvent = new CustomEvent(evtName, {detail: params});
			} else {
				ctmEvent = document.createEvent('CustomEvent');
				ctmEvent.initCustomEvent(evtName, true, true, params);
			}

			this.each(function(){this.dispatchEvent(ctmEvent);});
			return this;
		},
		click: function(fn){
			if(typeof fn === 'function'){
				this.each(function(){gQuery.bind(this,'click',fn);});
			} else {
				this.trigger('click');
			}
			return this;
		},
		select: function(){
			switch(this[0].tagName){
				case 'INPUT':case 'TEXTAREA':this[0].select();break;
				default:window.getSelection().selectAllChildren(this[0]);
			}
			return this;
		}
	};
	gQuery.fn.init.prototype = gQuery.fn;

	gQuery.extend = function(obj){for(let idx in obj){this[idx] = obj[idx];}};
	gQuery.extend({
		global: (typeof window !== 'undefined' ? window : global),
		isWindow: function(obj){
			return Object.prototype.toString.call(obj)==='[object Window]';
		},
		array: {
			unique: function(arr){
				let j = {};
				arr.forEach(function(v){
					let typ = typeof v,vv=v;
					if(typ==='object'){
						(v.tagName) ? (typ='node',v = v.innerHTML) : v = JSON.stringify(v);
					}
					j[v + '::' + typ] = vv;
				});
				return Object.keys(j).map(function(v){return j[v];});
			}
		},
		bind: function(obj,evtName,fn){
			if(obj.addEventListener){
				obj.addEventListener(evtName,fn,false);
			} else {obj.attachEvent('on'+evtName,fn);}
		},
		strToNode: function(str){
			if(typeof str === 'string'){
				let temp = document.createElement('div');
				temp.innerHTML = str;
				str = document.createDocumentFragment();
				while (temp.firstChild) {str.appendChild(temp.firstChild);}
			}
			return str;
		},
		copy: function(str){
			if(typeof str==='object'){str = $(str).text();}

			$('body').append("<textarea id='gQuery-copyTemp'>"+str+"</textarea>");
			$('#gQuery-copyTemp').select();document.execCommand("Copy");
			$('#gQuery-copyTemp').remove();
		},
		deepClone: function(obj){
			let copy = Object.create(Object.getPrototypeOf(obj)),
			propNames = Object.getOwnPropertyNames(obj);

			propNames.forEach(function(name) {
				let desc = Object.getOwnPropertyDescriptor(obj, name);
				Object.defineProperty(copy, name, desc);
			});
			return copy;
		},
		storage: {
			local: function(){return $.global.localStorage},
			read: function(key,typ){
				if(!typ){return this.local().getItem(key);}

				let keyData = this.local().getItem(key);
				if(typ=='array' || typ=='object'){
					try{keyData = JSON.parse(keyData);} catch(err){}
				}
				return keyData;
			},
			write: function(key,data){
				(typeof data=='object') && (data = JSON.stringify(data));
				this.local().setItem(key,data);
			},
			remove: function(key){this.local().removeItem(key);},
			clearAll: function(){this.local().clear();},
			push: function(key,data,ext){
				let kd = this.read(key);
				if(!kd){
					data = '['+JSON.stringify(data)+']';this.write(key,data);
					return this.read(key);
				} else {
					try{
						let tkd = JSON.parse(kd);
						if( gQuery.array.is(tkd) ){tkd.push(data);kd = tkd;} else {
							kd = JSON.parse('['+kd+']');kd.push(data);
						}
					} catch(err){
						kd = '['+JSON.stringify(kd)+']';kd = JSON.parse(kd);
						kd.push(data);
					}
					if(ext=='unique'){kd = gQuery.array.unique(kd);}
					this.write(key,JSON.stringify(kd));
					return this.read(key,'array');
				}
			}
		}
	});
	return gQuery;
}));
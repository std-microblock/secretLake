// gxz-basic.js under GNU GPLv3

'use strict';var __sl = {};
if( typeof gxz != 'object' ){
	console.log("%c SecretLake %c A Light,Beauty,Inact Blog ","color: #fff; margin-top: 1em; padding: 5px 0; background: #000; font-weight: 600;","margin-bottom: 1em; padding: 5px 0; background: #efefef; color: #333");
}
var gxz = {
	namespace: function(ns){
		let parts = ns.split("."),object = this,i,len;
		for (i=0, len=parts.length; i < len; i++) {
			if(!object[parts[i]]) {object[parts[i]] = {};}
			object = object[parts[i]];
		}
		return object;
	},
	load: {done:0,ti:0},
	temp: {}
};
gxz.cookie = {
	set: function(name,value,hours){
		hours = Number(hours);let exp = new Date();
		exp.setTime(exp.getTime() + hours*60*60*1000);
		document.cookie = name + "="+ encodeURIComponent (value) + ";expires=" + exp.toGMTString() + ";path=/";
	}
}
// 代码块等 TXT -> HTML 解析
gxz.parse = {
	codebox: function(spl){
		let t = {},i;
		spl || (spl='\n');
		$('.gcode-autoParse:not([data-gpbind])').each(function(){
			let codes = this.innerHTML.toString().split(spl);
			t.lang = $(this).attr('data-lang') || 'Text';
			t.h = "<div class='gtab-box'><div class='code-nav'><div class='codelang'>"+t.lang+"</div><i class='gi icon-edit-1 opt-copy' title='复制'></i></div><table class='code-list'>";
			for (i = 0; i < codes.length; i++) {
				t.ln = i+1;
				t.first = codes[i].substr(0,1);
				if(t.first=='#'){
					codes[i] = "<span class='gc-remark'>"+codes[i]+"</span>";
				}
				t.h += "<tr><td class='num'>"+t.ln+"</td><td class='code'>"+codes[i]+"</td></tr>";
			}
			t.h += "</table></div>";
			this.innerHTML = t.h;
		}).attr('data-gpbind','1');

		$('.gcode-autoParse .opt-copy:not([data-gpbind])').on('click',function(){
			let codes = $(this).parent().parent().find('.code-list .code');
			t.copy = "";
			for (i = 0; i < codes.length; i++) {
				t.c = codes[i].innerText;
				t.first = t.c.substr(0,1);
				if(t.first=='#'){continue;}
				t.copy += (t.copy=="" ? t.c : "\n"+t.c);
			}
			gxz.fn.copy(t.copy);
		}).attr('data-gpbind','1');
	},
	number: function(){
		$('.gnum-autoParse').each(function(){
			var num = {txt: $(this).text()};
			if(isNaN(num.txt) || num.txt==''){return true;}
			num.type = $(this).attr('data-ntype') || 'clear';

			switch(num.type){
				case 'level':
					num.res = Math.floor(num.txt/1000);
					if(num.res<1){num.res = num.txt;} else if(num.res>999){
						num.res = Math.floor(num.res/10)+'w';
					} else {num.res+='k';}
					break;
				default:
					num.res = num.txt.replace(/\d(?=(?:\d{3})+\b)/g,'$&,');
			}
			$(this).text( num.res );
		});
	},
	time: function(){
		$('.gtime-autoParse').each(function(){
			var _this = this;
			$(this).text( gxz.date.howLongAgo( gxz.date.diff($(_this).text(),gxz.date.time) ) );
		});
	}
}
// 主题
gxz.theme = {
	// 默认主题
	val: 'light',
	change: function(){
		var scheme = $.storage.read('theme');
		if(!scheme){
			if(gxz.date.hour>18 || gxz.date.hour<6){
				scheme = 'dark';
			}
		}
		if(!scheme){
			scheme = window.matchMedia("(prefers-color-scheme: light)").matches;
			scheme = (scheme === true ? 'light' : gxz.theme.val);
		}

		$('body').attr('unitvs-theme',scheme);
		gxz.theme.val = scheme;
	}
}
/*
 * 常用函数库
 */
gxz.fn = {
	// 复制字符串或对象字符
	copy: function(str){
		if(typeof str==='object'){str = $(str).text();}

		$('body').append("<textarea id='g-copytemp'>"+str+"</textarea>");
		$('#g-copytemp').select();document.execCommand("Copy");
		$('#g-copytemp').remove();
	}
}
gxz.get = {
	queryStr: function(name) {
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
		var r = window.location.search.substr(1).match(reg);
		if(r != null){return decodeURI(r[2]);}
		return null;
	},
	randomStr: function(len){
		len = len || 32;
		// 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
		var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
		var maxPos = $chars.length;
		var pwd = '';
		for (i = 0; i < len; i++) {
			pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
		}
		return pwd;
	}
}
/*
 * 元素常用函数库
 */
gxz.el = {
	// 获取元素距离文档顶部距离
	getTop: function(e){
		var offset = e.offsetTop;
		if(e.offsetParent != null){offset += gxz.el.getTop(e.offsetParent);}
		return offset;
	},
	show: function(opts){
		if(typeof opts !== 'object') {return 'empty object';}
		opts.el = ( typeof opts.el === 'object' ? opts.el : $(opts.el) );
		isNaN(opts.delay) && (opts.delay=500);
		isNaN(opts.wait) && (opts.wait=0);

		opts.ani = ( (opts.top) ? 1 : 0 );
		opts.top || (opts.top='0px');

		opts.el.css({'opacity':0});
		opts.el.each(function(){
			let _this = $(this);
			opts.css = {};

			if(opts.ani){
				opts.css.pos = _this[0].style.position || 'relative';
				_this.css({'position':opts.css.pos,'top':opts.top})
			}

			setTimeout(()=>{
				let aarr = {opacity:1};
				if(opts.ani){aarr.top = '0px';}
				
				this.animate([aarr],opts.delay);
				setTimeout(()=>{
					_this[0].style.transition = '';_this[0].style.opacity = '';
					if(opts.ani){_this[0].style.position = '';_this[0].style.top = '';}
				},opts.delay);
			},opts.wait);

			opts.wait += opts.delay;
		});

		return this;
	}
}
/*
 * 名言
 */
gxz.saying = {
	words: [
		{word:'不断蚕食，终能鲸吞',source:'《埃及艳后》'},
		{word:'时光偷走的，永远是你眼皮底下看不见的珍贵',source:''},
		{word:'春草明年绿，王孙归不归？',source:''},
		{word:'世间多无奈，别被风雪染',source:''},{word:'世事多无奈，莫随霜雪白',source:''},
		{word:'等世间所有的相遇，也等所有与你的久别重逢',source:''},
		{word:'如果能避开猛烈的欢喜，自然也不会有悲痛的来袭',source:''},
		{word:'世界上有太多孤独的人，害怕先踏出第一步',source:'《绿皮书》'},
		{word:'迷途漫漫，终有一归',source:'《不能承受的生命之轻》'},
		{word:'站远一点，才有机会去感动',source:''},
		{word:'想与你登临 摘雾霭晨曦',source:'《你一生的故事》'},
		{word:'你问我爱你值不值得，其实你应该知道，爱就是不问知值不值得',source:'张爱玲'},
		{word:'等着别人来爱你，不如自己爱自己',source:'毕淑敏'},
		{word:'报最大的希望，尽最大的努力，做最坏的打算，然后一切随缘，随遇而安',source:''},
		{word:'爱你所爱，行你所行，听从你心，无问西东',source:''},
		{word:'和任何一种生活，摩擦久了都会起球',source:''},
		{word:'你的性别不该限制你喜欢的任何东西',source:''},
		{word:'因为喜欢，万难可迎',source:''},
		{word:'自己淋过雨的人，才会想着给别人打伞',source:''}
	],
	random: function(arr,type){
		Array.isArray(arr) || (type = arr,arr = gxz.saying.words);
		type || (type='word');
		let say = arr[Math.floor(Math.random()*arr.length)];;
		switch(type){
			case 'word':return say.word;
			case 'both':return say;
		}
	}
}
/*
 * 助手
 */
gxz.aide = {
	enable: $.storage.read('aide_enable','int') || 0,
	ti_say: -1,
	words: [],
	say: function(word,sec){
		// 默认6s
		typeof sec !== 'number' && (sec=6);
		gxz.aide.words.push({w:word,s:sec});
		// 数组去重
		gxz.aide.words = gQuery.array.unique(gxz.aide.words);

		if(gxz.aide.ti_say<=0){
			gxz.aide.sayShow();
		}
	},
	sayShow: function(){
		if(gxz.aide.words.length==0){
			$('#uni-aide .aide-dialog').hide(500);return;
		}

		let obj = gxz.aide.words.shift();
		gxz.aide.ti_say = obj.s;
		$('#uni-aide .aide-dialog').html( obj.w );
		$('#uni-aide .aide-dialog').show(300);
	}
}
// 分页模块
gxz.pages = {
	put:function(opts){
		if(!opts || !opts.target || !opts.page || !opts.maxPage || !opts.pQuery){return false;}
		opts.target = ( typeof opts.target === 'object' ? opts.target : $(opts.target) );
		opts.turnType = ( typeof opts.pQuery === 'function' ? 'func' : 'url' );

		this.qmax = 0,this.qmin = 0;
		this.parr = [];
		let t = {},i;

		for (i = 0; i < 3; i++) {
			t.qnext = opts.page + i;
			t.qnext < opts.maxPage ? this.push(t.qnext) : this.qmax=1;

			t.qnext = opts.page - i;
			t.qnext > 0 ? this.push(t.qnext) : this.qmin=1;
		}

		if(this.qmax==1){this.push(opts.maxPage);}
		if(this.qmin==1){this.push(1,0);}

		t.qhtml = '';
		this.parr = this.parr.sort(function(a,b){return a - b})
		for (i = 0; i < this.parr.length; i++) {
			t.pg = this.parr[i];
			if(t.pg==opts.page){
				t.qhtml += "<div class='page-item active'>"+t.pg+"</div>";
			} else {
				if(opts.turnType=='func'){
					t.qhtml += "<div class='page-item page-turnTo'>"+t.pg+"</div>";
				} else {
					t.qhtml += "<a class='page-item' href='"+opts.pQuery+t.pg+"'>"+t.pg+"</a>";
				}
			}
		}

		if(this.qmax==0){
			if(opts.turnType=='func'){
				t.qhtml += "<div class='page-item clear'>...</div><div class='page-item page-turnTo'>"+_p.total+"</div>";
			} else {
				t.qhtml += "<div class='page-item clear'>...</div><a class='page-item' href='"+opts.pQuery+opts.maxPage+"'>"+opts.maxPage+"</a>";
			}
		}
		if(this.qmin==0){
			if(opts.turnType=='func'){
				t.qhtml = "<a class='page-item page-turnTo'>1</a><div class='page-item clear'>...</div>"+t.qhtml;
			} else {
				t.qhtml = "<a class='page-item' href='"+opts.pQuery+"1'>1</a><div class='page-item clear'>...</div>"+t.qhtml;
			}
		}

		opts.target.html(t.qhtml);

		if(opts.turnType=='func'){
			opts.target.find('.page-turnTo').click(opts.pQuery);
		}
	},
	push: function(page,idx){
		!idx&&idx!=0 && (idx=this.parr.length-1);
		this.parr.splice(idx,0,page);
		this.parr = gQuery.array.unique(this.parr);
	}
}
/*
 * 遮罩层
 */
gxz.overlay = {
	show: function(){
		$('#uni-overlayTip').fadeIn(400);
	},
	msg: function(){
		$('#uni-overlayTip .subTip').fadeIn(300);
	},
	hide: function(){
		gxz.overlay.ti = -1;

		$('#uni-overlayTip .loader').addClass('done');
		$('#uni-overlayTip .subTip').fadeOut(200,function(){
			setTimeout(()=>{
				$('#uni-overlayTip').fadeOut(300,function(){
					$('#uni-overlayTip .loader').removeClass('done');
				});
			},200);
		});
	},
	ti:30
}

if(window.location.host.indexOf('gxzv') < 0){window.location.href='//www.gxzv.com';}

$(function(){
	let t = {},i;

	// 预加载遮罩层
	if( $('#uni-overlayTip:not([data-wait])').length>0 ){
		gxz.overlay.hide();
	}

	gxz.load.done++;
	if(gxz.load.done==1){navPut();footerPut();gxz.date.fnTick();}

	gxz.theme.change();
	window.matchMedia("(prefers-color-scheme: light)").addListener(gxz.theme.change);

	gxz.parse.codebox();gxz.parse.number();gxz.parse.time();
});

//顶部导航放置
gxz.namespace("nav");
function navPut() {
	let nav = {user:""};
	nav.header = $('#navput:not([data-disable])');

	if(nav.header.length > 0) {
		if( typeof nav.header.attr('data-hide-user') == 'undefined' ){
			nav.user = "<div id='nav-user'><div class='tip'><a href='/u/signin/'>登入</a> 或 <a href='/u/register/'>注册商家</a></div></div>";
		}
		
		nav.header.html('Nav');
		nav.header.find('.dropdown').click(function(){
			$(this).toggleClass('active');
		});
		_navUserUpdate();
	}
}
function _navUserUpdate(){
	return;
	$.ajax({
		type:"POST",url:"/lib/php/user/information.php",
		data:{action:'getPrivate'}
	}).done(function(str){
		let resp;
		try{resp = JSON.parse(str);} catch(err){console.log(str);return;}

		resp.id = parseInt(resp.id);resp.newMsg = parseInt(resp.newMsg);
		resp.power = parseInt(resp.power);resp.status = parseInt(resp.status);
		gxz.user = resp;
		if(resp.g_status!='success'){return;}
		
		$('#nav-user').html("<a class='gl-avatar' href='/u/' target='_self'><img src='"+resp.avatar+"'></a>");
		$('#nav-user').on({
			'mouseover':function(){$(this).find('.gl-avatar').addClass('ga-shake');},
			'mouseleave':function(){$(this).find('.gl-avatar').removeClass('ga-shake');}
		});

		if(resp.newMsg>0){
			resp.newMsg>99 && (resp.newMsg='99+');
			$('#nav-user').append("<span class='nav_user_message_count'>"+resp.newMsg+"</span>");
		}
	});
}
function footerPut() {
	let footer = $('#navFooter')[0] || false, t = {};
	if(footer) {
		switch( $.storage.read('theme') ){
			case 'dark':t.icon = 'icon-moon';break;
			case 'light':t.icon = 'icon-sun';break;
			default:t.icon = 'icon-sun';
		}

		t.say = gxz.saying.random('both');
		t.sayT = t.say.word;
		t.say.source!='' && (t.sayT+=' —'+t.say.source);

		footer.innerHTML = "<div class='footerNav'>"+
			"<div class='footer-banner'><a class='item' href='https://mc.ganxiaozhe.com' target='_blank'><i class='icon gi icon-leaf-1'></i><span class='text'>Ganxiaozhe</span></a><a class='item' href='https://www.mcadmin.cn' target='_blank'><i class='icon gi icon-cube'></i><span class='text'>MCAdmin</span></a></div>"+
			"<div class='footer-state'>"+
				"<div class='gl-flex btw'><div class='gxz-info'><a href='//www.unitvs.com/' target='_blank'>gxzv.com</a> / <a href='http://beian.miit.gov.cn/' target='_blank'>渝ICP备20007909号-4</a></div><div class='disclaimers'><span>Copyright © 2020 GXZV. All rights reserved./</span><div class='listMap'><a id='gxz-copyright' href='/copyright.html'>法律声明及版权</a> / <a id='gxz-mdf-theme'><i class='gi "+t.icon+"'></i> 主题</a></div></div></div>"+
				"<div class='gl-flex btw'><div class='gxz-info'>"+t.sayT+"</div><div class='disclaimers'>powered by <a target='_blank' href='https://secretlake.org/'>SecretLake</a></div></div>"+
			"</div>"+
		"</div>";

		$('#gxz-mdf-theme').click(function(){
			switch(gxz.theme.val){
				case 'dark':
					$.storage.write('theme','light');
					$(this).find('.gi')[0].className = 'gi icon-sun';
					gxz.theme.change();break;
				case 'light':
					$.storage.write('theme','dark');
					$(this).find('.gi')[0].className = 'gi icon-moon';
					gxz.theme.change();break;
			}
		});

		let fh = $('#navFooter')[0].offsetHeight;
		$('#navFooter').css({'margin-top':'-'+fh+'px'});
		$('#all-container').css({'padding-bottom':fh+'px'});
	}
}


gxz.namespace("date");
gxz.date.fnTick = function(){
	gxz.date.d = new Date();
	gxz.date.year = gxz.date.d.getFullYear();
	gxz.date.month = gxz.date.d.getMonth() + 1;
	gxz.date.day = gxz.date.d.getDate();
	gxz.date.hour = gxz.date.d.getHours();
	gxz.date.minute = gxz.date.d.getMinutes();
	gxz.date.second = gxz.date.d.getSeconds();
	gxz.date.time = gxz.date.year+'-'+gxz.date.month+'-'+gxz.date.day+' '+gxz.date.hour+':'+gxz.date.minute+':'+gxz.date.second;
	setTimeout(()=>{
		gxz.date.fnTick();
	},500);	
}
gxz.date.diff = function(faultDate, completeTime){
	let t = {},diff = {};
	t.stime = Date.parse(new Date(faultDate));
	isNaN(t.stime) && ( t.stime = Date.parse(new Date( String(faultDate).replace(/-/g,'/') )) );
	t.etime = Date.parse(new Date(completeTime));
	isNaN(t.etime) && ( t.etime = Date.parse(new Date( String(completeTime).replace(/-/g,'/') )) );
	// 两个时间戳相差的毫秒数
	t.dtime = t.etime - t.stime;
	diff.d = Math.floor(t.dtime / (24 * 3600 * 1000));
	t.dlvl1 = t.dtime % (24 * 3600 * 1000);  
	diff.h = Math.floor(t.dlvl1 / (3600 * 1000));
	t.dlvl2 = t.dlvl1 % (3600 * 1000);		
	diff.m = Math.floor(t.dlvl2 / (60 * 1000));
	diff.s = t.dlvl2 % (1000*60) / 1000;
	return diff;
}
gxz.date.howLongAgo = function(arr){
	if(typeof arr != 'object'){return false;}
	if(arr.d>0){
		if(arr.d>=30){
			arr.mon = Math.floor(arr.d/30);
			if(arr.mon>=12){
				arr.year = Math.floor(arr.d/12);
				return arr.year+"年前";
			}

			return arr.mon+"个月前";
		}

		if(arr.d==1){return "昨天";}
		if(arr.d==2){return "前天";}
		return arr.d+"天前";
	}
	if(arr.h>0){return arr.h+"小时前";}
	if(arr.m>0){return arr.m+"分钟前";}
	if(arr.s>0){return arr.s+"秒前";}
	if(arr.s==0){return "现在";}
	return "未知";
}


/*
 * Ganxiaozhe Event
 */
gxz.namespace('e');

setInterval(function(){
	gxz.overlay.ti>-1 && (gxz.overlay.ti--);
	if(gxz.overlay.ti==0){
		gxz.overlay.msg();
	}

	gxz.aide.ti_say>-1 && (gxz.aide.ti_say--);
	if(gxz.aide.ti_say==0){
		gxz.aide.sayShow();
	}
},1000);

/*
 * 提示弹窗
 */
gxz.alert = function(opts){return gxz.alert.fn.out(opts);}
gxz.alert.prototype = gxz.alert.fn = {
	out:function(opts){
		if(typeof opts !== 'object') {return 'empty object';}
		opts.yes || (opts.yes = function(){});opts.no || (opts.no = function(){});
		opts.yesT || (opts.yesT='确定');opts.noT || (opts.noT='取消');

		this.id ? this.id++ : this.id=1;

		let _this = this;
		let html = "<div class='gl-overlay g-dialog'><div class='ly-block-fixed'><div class='ly-head'>"+opts.title+"</div><div class='ly-body'>"+opts.message+"</div><div class='ly-footer noSelect'><button type='button' class='ly-btn btn-gray dialog-no-"+_this.id+"'><i class='gi icon-cancel' aria-hidden='true'></i>"+opts.noT+"</button><button type='button' class='ly-btn btn-aqua dialog-yes-"+_this.id+"'><i class='gi icon-ok' aria-hidden='true'></i>"+opts.yesT+"</button></div></div></div>";
		$('body').append(html);
		$('.g-dialog').fadeIn(500);
		// 确定按钮
		$('.dialog-yes-'+_this.id).click(function(){
			opts.yes();
			$(this).parent().parent().parent().fadeOut(500,function(){
				$(this).remove();
			});
		});
		// 取消按钮
		$('.dialog-no-'+_this.id).click(function(){
			opts.no();
			$(this).parent().parent().parent().fadeOut(500,function(){
				$(this).remove();
			});
		});
	}
};
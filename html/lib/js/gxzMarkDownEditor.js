// ==================================================
// GXZMarkDownEditor v1.0.5 (GMDE)
// 
// 采用 GPLv3 许可证供开源使用
// 或用于商业用途的 GMDE 商业许可证
// 所有商业应用程序（包括您计划出售的网站，主题和应用程序）
// 都需要具有商业许可证。
//
// Licensed GPLv3 for open source use
// or GMDE Commercial License for commercial use
//
// Copyright 2020 Ganxiaozhe
//
// ==================================================
;(function($,factory){
	if(!$){return '缺少gQuery！';}
	if(typeof global === 'undefined'){var global;}

	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = window || self, global.geditor = factory());

	console.log('%c gxzMarkDownEditor %c https://ganxiaozhe.com \n','color: #fff; background: #030307; padding:5px 0; margin-top: 1em;','background: #efefef; color: #333; padding:5px 0;');
}(gQuery,function(){
	'use strict';
	var geditor = function(id,opts){
		return new geditor.fn.init(id,opts);
	}

	geditor.prototype = geditor.fn = {
		init: function(id,opts){
			opts = opts || {};
			if(typeof id === 'object'){this.id = $(id).attr('id');} else {this.id = id;}
			if($('#'+this.id).length<1){return false;}

			if(opts.pushHTML!=0){
				$('#'+this.id).html("<div class='gmde-tool-bar'>"+
					"<div class='toolBtn gedt-bold' title='加粗强调'><strong>B</strong></div>"+
					"<div class='toolBtn gedt-italic' title='斜体'><em>I</em></div>"+
					"<div class='toolBtn gedt-noun' title='添加名词、行内代码、或强调'><i class='gi icon-info-1'></i></div>"+
					"<div class='toolBtn gedt-url' title='添加超链接'><i class='gi icon-weibiaoti-'></i></div>"+
					"<div class='toolBtn gedt-img' title='添加图片'><i class='gi icon-picfill'></i></div>"+
					"<div class='toolBtn gedt-video' title='添加视频'><i class='gi icon-record'></i></div>"+
					"<div class='toolBtn gedt-code' title='添加代码块'><i class='gi icon-code'></i></div>"+
					"<div class='toolBtn gedt-quote' title='添加引用'><i class='gi icon-angle-double-right'></i></div>"+
					"<div class='toolBtn gedt-save btn-hide' title='保存'><i class='gi icon-history'></i></div>"+
				"</div>"+
				"<div class='gmde-msg-bar'>"+
					"<div class='msg-el'>Ganxiaozhe MarkDown Editor.</div>"+
				"</div>"+
				"<textarea class='gmde-input' maxlength='8000'></textarea>");
			}

			var _this = this,t = {};
			$('#'+this.id).addClass('gmde-container');
			this.input = $('#'+this.id).find('.gmde-input');
			this.msg = $('#'+this.id).find('.gmde-msg-bar');
			this.preview = '';
			this.length = {max:-1,min:0};
			this.autoSave = {sec:30};

			var updateHandle = function(){
				_this.updateHandle();
			}

			this.input.on('input',updateHandle);
			this.updateSecHandle();

			$('.gmde-tool-bar .gedt-bold').click(()=>{
				var selection = _this.getSelection() || '加粗';
				_this.pushSelection('\*\*'+selection+'\*\*');
			});
			$('.gmde-tool-bar .gedt-italic').click(()=>{
				var selection = _this.getSelection() || '斜体';
				_this.pushSelection('\*'+selection+'\*');
			});
			$('.gmde-tool-bar .gedt-noun').click(()=>{
				var selection = _this.getSelection() || '强调';
				_this.pushSelection('`'+selection.replace(/`/g,'')+'`');
			});
			$('.gmde-tool-bar .gedt-code').click(()=>{
				var selection = _this.getSelection() || '代码';
				t.val = _this.input.val();
				var endSel = _this.input[0].selectionEnd;
				endSel = t.val.charAt(endSel-1);

				t.str = ( endSel=='\n' || t.val=='' ? '```Text' : '\n```Text' );

				_this.pushSelection([t.str,selection,'```'].join('\n'));
			});
			$('.gmde-tool-bar .gedt-quote').click(()=>{
				var selection = _this.getSelection() || '引用';
				t.val = _this.input.val();
				var endSel = _this.input[0].selectionEnd;
				endSel = t.val.charAt(endSel-1);

				t.str = ( endSel=='\n' || t.val=='' ? '>>>' : '\n>>>' );

				_this.pushSelection([t.str,selection,'>>>'].join('\n'));
			});
			$('.gmde-tool-bar .gedt-url').click(()=>{
				var selection = _this.getSelection();
				_dialogBox({
					title:'添加超链接',message:"<input class='form-fluid' id='mgedt-url' value='https://'/><input class='form-fluid mt-2' id='mgedt-urlName' placeholder='链接名' value='"+selection+"'/>",
					yes:function(){
						var url = {url:$('#mgedt-url').val(),name:$('#mgedt-urlName').val()};
						if(!url.url){return;}
						url.name || (url.name=url.url);

						_this.pushSelection('['+url.name+']('+url.url+')');
					}
				});
			});
			$('.gmde-tool-bar .gedt-img').click(()=>{
				var selection = _this.getSelection();
				_dialogBox({
					title:'添加图片',message:"<input class='form-fluid' id='mgedt-img' value='https://'/><input class='form-fluid mt-2' id='mgedt-imgAlt' placeholder='图片介绍' value='"+selection+"'/>",
					yes:function(){
						var img = {url:$('#mgedt-img').val(),alt:$('#mgedt-imgAlt').val()};
						if(!img.url){return;}
						img.alt || (img.alt=img.url);

						if(!/\.(gif|jpg|jpeg|png|GIF|JPEG|JPG|PNG)$/.test(img.url)){
							_this.pushSelection("!["+img.alt+"]("+img.url+")");
							_this.pushMsg("该链接看起来不像是图片，请检查它是否能正常加载",'new');return false;
						}

						var il_ = new Image();
						il_.alt = img.alt;
						il_.src = img.url;
						_this.pushMsg("正在解析图片 "+img.url,'new');

						if(il_.complete){
							_this.pushSelection("!["+il_.alt+"]("+il_.src+" size='"+il_.width+"px,"+il_.height+"px')");
							_this.pushMsg("图片解析成功！已为其自动添加尺寸信息",'new');
						} else {
							il_.onerror = function(){
								_this.pushMsg("图片 "+il_.src+" 资源无法访问，解析失败！",'new');
								il_.onload = null;
							};

							il_.onload = function(){
								_this.pushSelection("!["+il_.alt+"]("+il_.src+" size='"+il_.width+"px,"+il_.height+"px')");
								_this.pushMsg("图片解析成功！已为其自动添加尺寸信息",'new');
							}
						} // 获取图片尺寸 - END
					}
				});
			});
			$('.gmde-tool-bar .gedt-video').click(()=>{
				var selection = _this.getSelection();
				t.val = _this.input.val();
				var endSel = _this.input[0].selectionEnd;
				endSel = t.val.charAt(endSel-1);

				t.str = ( endSel=='\n' || t.val=='' ? '[bilibili]' : '\n[bilibili]' );
				_dialogBox({
					title:'添加视频',message:"<select class='form-fluid'><option value='bilibili'>bilibili</option></select><input class='form-fluid mt-2' id='mgedt-videoUrl' placeholder='iframe src 链接' value='"+selection+"'/>",
					yes:function(){
						var url = $('#mgedt-videoUrl').val();
						if(!url){return;}
						if(url.indexOf('player.bilibili.com')<0){
							_dialogBox({title:'提示',message:"<p>请输入正确的视频 iframe 链接！</p><br/><p>bilibili 视频嵌入链接请在三连旁的分享中找到<b>嵌入代码</b>，复制 iframe src 中的链接。</p>"});return false;
						}

						_this.pushSelection(t.str+url+'[/bilibili]');
					}
				});
			});

			$('.gmde-tool-bar .gedt-save').click(()=>{
				this.autoSave.sec = 1;
			});

			return this;
		},
		set: function(opts){
			opts = opts || {};
			var _this = this;
			if($('#'+this.id).length<1){return false;}

			if(opts.preview){
				this.preview = ( typeof opts.preview === 'object' ? opts.preview : $(opts.preview) );
				this.preview.addClass('gmde-vHTML');
			}
			opts.maxlength && (this.length.max = parseInt(opts.maxlength));
			opts.minlength && (this.length.min = parseInt(opts.minlength));
			if(this.length.max > 0){
				this.input.attr('maxlength',this.length.max);
			} else {this.input.removeAttr('maxlength');}

			if(typeof opts.autoSave === 'object'){
				this.autoSave.name = (opts.autoSave.name ? opts.autoSave.name : 'gxzMarkDownEditor' );
				typeof opts.autoSave.load !== 'number' && (opts.autoSave.load = 1);
				if(opts.autoSave.name){
					var lastSave = gxz.storage.read(opts.autoSave.name);
					if(opts.autoSave.load==1 && lastSave){
						this.input.val(lastSave);
						this.pushMsg('上次数据加载成功','new');
						if(typeof this.preview === 'object') {this.previewHandle();}
					}

					$('.gmde-tool-bar .gedt-save').removeClass('btn-hide');
				}
				this.autoSave.time = (opts.autoSave.time ? opts.autoSave.time : 30 );
				opts.autoSave.time && (this.autoSave.sec = opts.autoSave.time);
			}

			return this;
		},
		updateSecHandle: function(){
			var _this = this;
			if(this.autoSave.time){
				this.autoSave.sec--;

				if(this.autoSave.sec<=0){
					gxz.storage.write(this.autoSave.name,this.input.val());
					this.autoSave.sec = this.autoSave.time;
					this.pushMsg('已为你自动保存 - '+gxz.date.time,'new');
				}
			}

			setTimeout(()=>{
				_this.updateSecHandle();
			},1000);
		},
		updateHandle: function(){
			if(typeof this.preview === 'object') {this.previewHandle();}

			var _ge = {};
			_ge.txt = this.input.val();
			_ge.tlen = this.input.val().length;
			_ge.minComp = this.length.min - _ge.tlen;
			_ge.maxComp = this.length.max - _ge.tlen;
			if( _ge.minComp>0 ){
				this.pushMsg('至少还需要输入 '+_ge.minComp+' 字');
			} else {
				this.pushMsg('最多还可输入 '+_ge.maxComp+' 字');
			}
		},
		pushMsg: function(str,mtype){
			var _this = this;
			mtype || (mtype='set');

			if(mtype=='set'){
				_this.msg.html('<div class="msg-el">'+str+'</div>');return _this;
			}

			_this.msg.addClass('gmdea-bg');
			_this.msg.find('.msg-el').animate({opacity:0,left:'-100px'},400,function(){
				_this.msg.html('<div class="msg-el before">'+str+'</div>');
				_this.msg.find('.msg-el.before').animate({opacity:1,left:'0px'},300,function(){
					_this.msg.removeClass('gmdea-bg');
				});
			});
			return _this;
		},
		previewHandle: function(opts){
			var _this = this,i,t = {};
			if(typeof opts === 'object'){
				_this.input = opts.input;
				_this.preview = opts.preview;
			}

			t.txt = _this.input.val().replace(/</g,'&lt;').replace(/>/g,'&gt;');

			var cells = t.txt.split('\n');
			t.codeMatch = 0;t.quoteMatch = 0;
			for (i = 0; i < cells.length; i++) {
				if(t.quoteMatch==1){
					if(cells[i] != '&gt;&gt;&gt;'){
						cells[i] = _this.toHtmlHandle(cells[i]);
						cells[i]+='<br>';continue;
					}
					cells[i] = '</div>';
					t.quoteMatch = 0;continue;
				}
				t.mQuote = cells[i].match(/^(?:&gt;&gt;&gt;.*?)/);
				if(t.mQuote !== null){
					cells[i] = '<div class="quote-box">';
					t.quoteMatch = 1;continue;
				}

				if(t.codeMatch==1){
					if(cells[i] != '```'){cells[i]+='<br>';continue;}
					cells[i] = '</pre>';
					t.codeMatch = 0;continue;
				}
				t.mCode = cells[i].match(/^(?:```.*?)/);
				if(t.mCode !== null){
					t.codeLang = cells[i].replace(/```/,'');
					cells[i] = '<pre class="gcode-autoParse" data-lang="'+t.codeLang+'">';
					t.codeMatch = 1;continue;
				}

				// 所有行内样式
				t.oldCell = _this.toHtmlHandle(cells[i],'inline');

				cells[i] = _this.toHtmlHandle(cells[i]);

				if(cells[i].length<1){
					cells[i] = '<br>';
				} else if(cells[i]==t.oldCell){
					cells[i] = '<p>'+cells[i]+'</p>';
				}
			}

			_this.preview.html( cells.join("").replace(/<br><\/pre>/g,'</pre>') );

			gxz.parse.codebox('<br>');
			$('img[data-gisrc]:not([data-gi-init])').giLazy();
		},
		toHtmlHandle(str,act){
			act || (act='');
			var _pre = {
				h1: new RegExp("^#{1} (.*)$"),
				h2: new RegExp("^#{2} (.*)$"),
				h3: new RegExp("^#{3} (.*)$"),
				hr: new RegExp("^-{4,}$"),
				bold: new RegExp("\\*{2}([^*].*?)\\*{2}",'g'),
				italic: new RegExp("\\*{1}([^*].*?)\\*{1}",'g'),
				noun: new RegExp("`{1,2}([^`].*?)`{1,2}",'g'),
				img: new RegExp("!\\[([^'\"\\s]*?)\\]\\((.*?)\\)",'g'),
				url: new RegExp("\\[([^'\"\\s]*?)\\]\\((.*?)\\)",'g'),
				bilibili: new RegExp("^\\[bilibili\\](.*?)\\[\/bilibili\\]$"),
			},_t = {};

			if(act=='inline'){
				str = str.replace(_pre.bold,'<strong>$1</strong>')
					.replace(_pre.italic,'<em>$1</em>')
					.replace(_pre.noun,'<span class="code-text">$1</span>')
					.replace(_pre.url,'<a href="$2" target="_blank"><i class="gi icon-weibiaoti-"></i>$1</a>');
				return str;
			}

			str = str.replace(_pre.h3,'<h3>$1</h3>')
				.replace(_pre.h2,'<h2>$1</h2>')
				.replace(_pre.h1,'<h1>$1</h1>')
				.replace(_pre.hr,'<div class="gmd-hr"></div>')
				.replace(_pre.bold,'<strong>$1</strong>')
				.replace(_pre.italic,'<em>$1</em>')
				.replace(_pre.noun,'<span class="code-text">$1</span>')
				.replace(_pre.img,'<img alt="$1" data-gisrc="$2" data-gazeimg>')
				.replace(_pre.url,'<a href="$2" target="_blank"><i class="gi icon-weibiaoti-"></i>$1</a>');

			_t.preW = this.preview[0].offsetWidth;
			_t.videoW = (_t.preW>1024 ? 1024 : _t.preW);_t.videoH = Math.floor(_t.videoW/1.48);
			str = str.replace(_pre.bilibili,'<iframe src="$1" class="gmd-video" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="'+_t.videoW+'" height="'+_t.videoH+'"> </iframe>');
			return str;
		},
		getSelection: function(str){
			var obj = this.input[0];

			if(window.getSelection) {
				if(obj.selectionStart != undefined && obj.selectionEnd != undefined) {
					return obj.value.substring(obj.selectionStart, obj.selectionEnd);
				} else {
					return "";
				}
			} else {
				return document.selection.createRange().text;
			}
		},
		pushSelection: function(str){
			var _this = this;
			var obj = this.input[0];

			if (document.selection) {
				var sel = document.selection.createRange();
				sel.text = str;
			} else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
				var startPos = obj.selectionStart;
				var endPos = obj.selectionEnd;
				var cursorPos = startPos;
				var tmpStr = obj.value;
				obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
				cursorPos += str.length;
				obj.selectionStart = obj.selectionEnd = cursorPos;
			} else {obj.value += str;}

			_this.updateHandle();

			return this;
		}
	};
	geditor.fn.init.prototype = geditor.fn;

	return geditor;
}));
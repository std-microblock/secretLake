'use strict';
__sl.rls = {};
__sl.coverMax = 1024*512;
$(function(){
	gxz.el.show({el:$('.nav-list li'),wait:500,delay:200});

	$('#rls-alias').on('keyup',function(){
		let alias = $(this).val().replace(/ /g,'-').replace(/[^0-9A-Za-z-_]/g,'');
		$('#tip-alias').html("URL 地址: "+window.location.origin+"/article/"+alias);

		if(alias.length<1){
			$('#tip-alias').html("文章路径名至少需要 1 字符！");
		}
		if(alias!=$(this).val()){
			$(this).val(alias);
			$('#tip-alias').html("别名只允许为<span class='code-text'>大小写英文</span> <span class='code-text'>_</span> 及 <span class='code-text'>-</span> 符号！");
		}
		if(alias.length>32){
			alias = alias.substr(0,32);
			$(this).val(alias);
			$('#tip-alias').html("项目名最长为 32 字符！");
		}
		__sl.rls.alias = alias;
	});

	$('#article-cover').on('change',function(){
		let file = this.files[0];
		if ( !/image\/\w+/.test(file.type) ) {
			gxz.alert({title:'提示',message:'Oooooops，只接受图片格式文件噢！'});
		}
		$('#article-cover').val('');

		coverFn.handle(file);
	});

	$('#rls-tag').on('keypress',function(e){
		if(e.keyCode!=13){return;}
		let tname = this.value.replace(/[^0-9A-Za-z\u4e00-\u9fa5-_]/g,'');
		if(!tname){return;}

		if( $('#rlsTag-pool .tag').length>9 ){
			gxz.alert({title:'提示',message:'标签最多只能添加 10 个！'});return false;
		}

		$('#rlsTag-pool').append("<div class='tag'>"+tname+"<i class='remove gi icon-cancel'></i></div>");
		$(this).val('');
		
		$('#rlsTag-pool .tag .remove:not([data-abind])').click(function(){
			$(this).parent().remove();
		}).attr('data-abind','y');
	});

	$('#rls-sumbit').click(rlsSubmit);

	__sl.ed = new geditor('gmde-container',{pushHTML:1}).set({
		preview:'#rls-preview',
		maxlength: 200000,minlength: 100,
		autoSave: {
			name: 'articleRelease',time: 30,load: 1
		}
	});
});

function rlsSubmit(){
	__sl.rls.title = $('#rls-title').val();
	__sl.rls.alias = $('#rls-alias').val();
	__sl.rls.intro = $('#rls-intro').val();
	__sl.rls.content = __sl.ed.input.val();
	__sl.rls.allowComment = parseInt( $('#rls-set-comment').val() );

	__sl.rls.tags = [];
	$('#rlsTag-pool .tag').each(function(){
		__sl.rls.tags.push(this.innerText);
	});

	let prob = [];
	__sl.rls.title || prob.push('标题不能为空');
	__sl.rls.alias || prob.push('路径名不能为空');
	__sl.rls.intro || prob.push('简介不能为空');
	__sl.rls.allowComment < 0 && prob.push('请完成评论设置');
	typeof __sl.rls.cover === 'object' || prob.push('封面不能为空');
	__sl.rls.content || prob.push('内容不能为空');
	(__sl.rls.content && __sl.rls.content.length>99) || prob.push('内容不能少于 100 字符');
	__sl.rls.tags.length > 10 && prob.push('标签数量不能大于 10 个');
	if(prob.length>0){
		gxz.alert({title:'发布失败',message:prob.join('<br/>')});return false;
	}

	__sl.rls.tags = JSON.stringify(__sl.rls.tags);
	let _fd = new FormData();
	for(let ona in __sl.rls){
		_fd.append(ona,__sl.rls[ona]);
	}
	
	fetch('/api/releaseArticle',{
		body:_fd,method:'POST'
	}).then(res => res.json()).then(function(resp){
		if(resp.status=='success'){
			resp.star=='star' ? (_pj.WEEK_STAR[6]++) : (_pj.WEEK_STAR[6]--);
			pjMgmt.chartUpdate();
		} else {
			evStar();_dialogBox({title:'操作失败: '+resp.status,message:resp.reason});
		}
	});
}

let coverFn = {};
coverFn.handle = function(file){
	let fr = new FileReader();
	fr.readAsDataURL(file);
	fr.onload = function(e){
		if(file.size > 1572864 && file.type=="image/gif"){
			gxz.alert({title:'添加失败',message:'该 gif 大于 1.5MB ，请换图重试！'});return;
		}
		// 若为 gif 且小于 1.5M 直接上传
		if(file.size <= 1572864 && file.type=="image/gif") {
			mgedtExt.imgPreUpload(file);return;
		}

		imgHandle.dealImage(this.result, { quality: 0.7 }, function(base) {
			var blob = imgHandle.dataURLtoBlob(base);
			var nfile = new File([blob], file.name, { type: file.type });

			if(nfile.size > __sl.rls.coverMax ){
				var nsize = {};
				nsize.kb = (nfile.size / 1024).toFixed(2);
				nsize.okb = (__sl.rls.coverMax / 1024).toFixed(2);
				gxz.alert({title:'添加失败',message:'该图片压缩后 '+nsize.kb+'KB 依然大于 '+nsize.okb+'KB ，请换图重试！'});return;
			}

			coverFn.done(nfile);
		});
	}
}
coverFn.done = function(file){
	__sl.rls.cover = file;
	let fr = new FileReader();
	fr.readAsDataURL(file);
	fr.onload = function(e){
		$('#img-rls-cover').attr({'src':this.result});
	};
};

let imgHandle = {
	dealImage(path, obj, callback){
		let img = new Image();
		img.src = path;
		img.onload = function() {
			var that = this;
			// 默认按比例压缩
			var w = that.width,h = that.height,scale = w / h;
			w = obj.width || w;
			h = obj.height || (w / scale);
			var quality = obj.quality || 0.7; // 默认图片质量为0.7

			//生成canvas
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			// 创建属性节点
			var anw = document.createAttribute("width");
			anw.nodeValue = w;
			var anh = document.createAttribute("height");
			anh.nodeValue = h;
			canvas.setAttributeNode(anw);
			canvas.setAttributeNode(anh);
			ctx.drawImage(that, 0, 0, w, h);

			// 图像质量
			if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
				quality = obj.quality;
			}
			// quality值越小，所绘制出的图像越模糊
			var base64 = canvas.toDataURL('image/jpeg', quality);
			// 回调函数返回base64的值
			callback(base64);
		}
	},
	dataURLtoBlob(dataurl){
		var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
		while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
		}
		return new Blob([u8arr], { type: mime });
	}
};
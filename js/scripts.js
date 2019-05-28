/**
 * 判断是否支持localStorage
 */
function supportstorage() {
	if (typeof window.localStorage=='object') 
		return true;
	else
		return false;		
}

/**
 * 自动保存
 * stopsave 锁字段用于阻止自动保存，成对出现，1上锁
 */
function handleSaveLayout() {
	var e = $(".demo").html();
	// 未加锁且内容有变化
	if (!stopsave && e != window.demoHtml) {
		stopsave++;
		window.demoHtml = e;
		saveLayout(); // 具体逻辑
		stopsave--;
	}
}
/**
 * 自动保存具体逻辑
 */
var layouthistory; // 当前页面最新数据
function saveLayout(){
	var data = layouthistory;
	if (!data) {
		data={}; // 组织数据格式
		data.count = 0; // 记录步数，当前步数
		data.list = []; // 记录每步的数据
	}
	if (data.list.length>data.count) {
		for (i=data.count;i<data.list.length;i++)
			data.list[i]=null; // 刷新后删除记录的步数后面多余的记录
	}
	// 存当前数据到一条新纪录
	data.list[data.count] = window.demoHtml;
	data.count++;
	if (supportstorage()) {
		localStorage.setItem("layoutdata",JSON.stringify(data));
	}
	layouthistory = data;
	//console.log(data);
	/*$.ajax({  
		type: "POST",  
		url: "/build/saveLayout",  
		data: { layout: $('.demo').html() },  
		success: function(data) {
			//updateButtonsVisibility();
		}
	});*/
}

function downloadLayout(){
	$.ajax({  
		type: "POST",  
		url: "/build/downloadLayout",  
		data: { layout: $('#download-layout').html() },  
		success: function(data) { window.location.href = '/build/download'; }
	});
}

function downloadHtmlLayout(){
	$.ajax({  
		type: "POST",  
		url: "/build/downloadLayout",  
		data: { layout: $('#download-layout').html() },  
		success: function(data) { window.location.href = '/build/downloadHtml'; }
	});
}

/**
 * 撤销
 */
function undoLayout() {
	var data = layouthistory;
	//console.log(data);
	if (data) {
		if (data.count<2) return false;
		window.demoHtml = data.list[data.count-2];
		data.count--;
		$('.demo').html(window.demoHtml);
		if (supportstorage()) {
			localStorage.setItem("layoutdata",JSON.stringify(data));
		}
		return true;
	}
	return false;
	/*$.ajax({  
		type: "POST",  
		url: "/build/getPreviousLayout",  
		data: { },  
		success: function(data) {
			undoOperation(data);
		}
	});*/
}

/**
 * 重做
 */
function redoLayout() {
	var data = layouthistory;
	if (data) {
		if (data.list[data.count]) {
			window.demoHtml = data.list[data.count];
			data.count++;
			$('.demo').html(window.demoHtml);
			if (supportstorage()) {
				localStorage.setItem("layoutdata",JSON.stringify(data));
			}
			return true;
		}
	}
	return false;
	/*
	$.ajax({  
		type: "POST",  
		url: "/build/getPreviousLayout",  
		data: { },  
		success: function(data) {
			redoOperation(data);
		}
	});*/
}

/**
 * 处理各种ids
 */
function handleJsIds() {
	handleModalIds();
	handleAccordionIds();
	handleCarouselIds();
	handleTabsIds()
}
// 拖入手风琴处理id
function handleAccordionIds() {
	var e = $(".demo #myAccordion");
	var t = randomNumber();
	var n = "accordion-" + t;
	var r;
	e.attr("id", n);
	e.find(".accordion-group").each(function(e, t) {
		r = "accordion-element-" + randomNumber();
		$(t).find(".accordion-toggle").each(function(e, t) {
			$(t).attr("data-parent", "#" + n);
			$(t).attr("href", "#" + r)
		});
		$(t).find(".accordion-body").each(function(e, t) {
			$(t).attr("id", r)
		})
	})
}
// 拖入轮播图处理id
function handleCarouselIds() {
	var e = $(".demo #myCarousel");
	console.log(JSON.stringify(e))
	var t = randomNumber();
	var n = "carousel-" + t;
	e.attr("id", n);
	e.find(".carousel-indicators li").each(function(e, t) {
		$(t).attr("data-target", "#" + n)
	});
	e.find(".left").attr("href", "#" + n);
	e.find(".right").attr("href", "#" + n)
}
// 拖入模态框处理id
function handleModalIds() {
	var e = $(".demo #myModalLink");
	var t = randomNumber();
	var n = "modal-container-" + t;
	var r = "modal-" + t;
	e.attr("id", r);
	e.attr("href", "#" + n);
	e.next().attr("id", n)
}
// 拖入切换卡处理id
function handleTabsIds() {
	var e = $(".demo #myTabs");
	var t = randomNumber();
	var n = "tabs-" + t;
	e.attr("id", n);
	e.find(".tab-pane").each(function(e, t) {
		var n = $(t).attr("id");
		var r = "panel-" + randomNumber();
		$(t).attr("id", r);
		$(t).parent().parent().find("a[href=#" + n + "]").attr("href", "#" + r)
	})
}
// 生成随机数，用于生产id
function randomNumber() {
	// 返回指定区间随机数
	function randomFromInterval(e, t) {
		return Math.floor(Math.random() * (t - e + 1) + e)
	}
	return randomFromInterval(1, 1e6)
}

/**
 * 栅格系统
 * 拼装模板，校验合法性
 */
function gridSystemGenerator() {
	$(".lyrow .preview input").bind("keyup", function() {
		var e = 0;
		var t = "";
		var n = $(this).val().split(" ", 12); // 12数组最大长度
		// 拼装模板
		$.each(n, function(n, r) {
			e += parseInt(r);
			t += '<div class="span' + r + ' column"></div>'
		});
		// 列数12，合法才显示
		if (e == 12) {
			$(this).parent().next().children().html(t);
			$(this).parent().prev().show()
		} else {
			$(this).parent().prev().hide()
		}
	})
}
/**
 * 元素编辑区 configuration
 * 【编辑】【无样式】【嵌入】
 */
function configurationElm(e, t) {
	// a标签类型
	$(".demo").delegate(".configuration > a", "click", function(e) {
		e.preventDefault();
		var t = $(this).parent().next().next().children();
		$(this).toggleClass("active");
		t.toggleClass($(this).attr("rel"))
	});
	// 下拉菜单类型
	$(".demo").delegate(".configuration .dropdown-menu a", "click", function(e) {
		e.preventDefault();
		var t = $(this).parent().parent();
		var n = t.parent().parent().next().next().children();
		t.find("li").removeClass("active");
		$(this).parent().addClass("active");
		var r = "";
		t.find("a").each(function() {
			r += $(this).attr("rel") + " "
		});
		t.parent().removeClass("open");
		n.removeClass(r);
		n.addClass($(this).attr("rel"))
	})
}
/**
 * 删除一个元素
 */
function removeElm() {
	$(".demo").delegate(".remove", "click", function(e) {
		e.preventDefault();
		$(this).parent().remove();
		// 删除最后一个时候，全清除
		if (!$(".demo .lyrow").length > 0) {
			clearDemo()
		}
	})
}
/**
 * 完全清除页面和缓存数据
 */
function clearDemo() {
	$(".demo").empty();
	layouthistory = null;
	if (supportstorage())
		localStorage.removeItem("layoutdata");
}
// 移除顶部菜单按钮 active
function removeMenuClasses() {
	$("#menu-layoutit li button").removeClass("active")
}
// 切换自适应宽度和固定宽度
function changeStructure(e, t) {
	$("#download-layout ." + e).removeClass(e).addClass(t)
}
/**
 * 去除当前层级嵌套，子元素放入父元素，删除当前层级
 * @param {*} e 
 */
function cleanHtml(e) {
	$(e).parent().append($(e).children().html())
}
/**
 * 设置下载会话框中的源码
 * ？？？
 */
function downloadLayoutSrc() {
	var e = "";
	// .demo 放入 #download-layout
	$("#download-layout").children().html($(".demo").html());
	var t = $("#download-layout").children();
	// 去除不相关的功能标签
	t.find(".preview, .configuration, .drag, .remove").remove();
	// 给 .lyrow .box-element 添加标记 .removeClean
	t.find(".lyrow").addClass("removeClean");
	t.find(".box-element").addClass("removeClean");
	// 删除6层、5层，4，3，2，1...
	t.find(".lyrow .lyrow .lyrow .lyrow .lyrow .removeClean").each(function() {
		cleanHtml(this)
	});
	t.find(".lyrow .lyrow .lyrow .lyrow .removeClean").each(function() {
		cleanHtml(this)
	});
	t.find(".lyrow .lyrow .lyrow .removeClean").each(function() {
		cleanHtml(this)
	});
	t.find(".lyrow .lyrow .removeClean").each(function() {
		cleanHtml(this)
	});
	t.find(".lyrow .removeClean").each(function() {
		cleanHtml(this)
	});
	t.find(".removeClean").each(function() {
		cleanHtml(this)
	});
	t.find(".removeClean").remove();
	// 去除层级上党 jquery-ui 拖拽
	$("#download-layout .column").removeClass("ui-sortable");
	// 去除 column
	$("#download-layout .row-fluid").removeClass("clearfix").children().removeClass("column");
	//
	if ($("#download-layout .container").length > 0) {
		changeStructure("row-fluid", "row")
	}
	// 使用插件清理html
	formatSrc = $.htmlClean($("#download-layout").html(), {
		format: true,
		allowedAttributes: [
			["id"],
			["class"],
			["data-toggle"],
			["data-target"],
			["data-parent"],
			["role"],
			["data-dismiss"],
			["aria-labelledby"],
			["aria-hidden"],
			["data-slide-to"],
			["data-slide"]
		]
	});
	$("#download-layout").html(formatSrc);
	$("#downloadModal textarea").empty();
	$("#downloadModal textarea").val(formatSrc)
}

// var currentDocument = null;
var timerSave = 1000; // 自动保存时间间隔
var stopsave = 0; // 锁，用于阻止自动保存
var startdrag = 0; // 判断是否正在拖动
var demoHtml = $(".demo").html(); // 实际html
var currenteditor = null; // CKEDITOR 中的编辑内容

$(window).resize(function() {
	setWindowSize();
});

/**
 * 从 localstorage 获取数据
 * 布局数据存储在 layoutdata 字段，JSON 格式
 * {
    "count": 3, // 步数，用于撤回
	"list": []
 * }
 */
function restoreData(){
	if (supportstorage()) {
		layouthistory = JSON.parse(localStorage.getItem("layoutdata"));
		if (!layouthistory) return false;
		// 获取最新的数据并加载
		window.demoHtml = layouthistory.list[layouthistory.count-1];
		if (window.demoHtml) $(".demo").html(window.demoHtml);
	}
}

/**
 * 初始化容器
 */
function initContainer(){
	// 设置右侧面板元素可以拖动排序
	$(".demo, .demo .column").sortable({
		connectWith: ".column",
		opacity: .35,
		handle: ".drag",
		start: function(e,t) {
			if (!startdrag) stopsave++;
			startdrag = 1;
		},
		stop: function(e,t) {
			if(stopsave>0) stopsave--;
			startdrag = 0;
		}
	});
	configurationElm();
}

/**
 * 重置窗口大小，设置 min-height
 */
function setWindowSize () {
	$("body").css("min-height", $(window).height() - 90);
	$(".demo").css("min-height", $(window).height() - 160);
}

/**
 * 核心主程序
 */
$(document).ready(function() {

	// 初始化 CKEDITOR，传入html源码进行编辑
	CKEDITOR.disableAutoInline = true;
	var contenthandle = CKEDITOR.replace( 'contenteditor' ,{
		language: 'zh-cn',
		contentsCss: ['css/bootstrap-combined.min.css'],
		allowedContent: true
	});

	// 加载localstorage数据
	restoreData();
	// 重置窗口大小，设置 min-height
	setWindowSize();
	// 左侧布局允许拖入右侧工作区（.demo）
	$(".sidebar-nav .lyrow").draggable({
		connectToSortable: ".demo",
		helper: "clone",
		handle: ".drag", // 拖动手柄
		start: function(e,t) {
			if (!startdrag) stopsave++;
			startdrag = 1;
		},
		drag: function(e, t) {
			t.helper.width(400)
		},
		stop: function(e, t) {
			$(".demo .column").sortable({
				opacity: .35,
				connectWith: ".column",
				start: function(e,t) {
					if (!startdrag) stopsave++;
					startdrag = 1;
				},
				stop: function(e,t) {
					if(stopsave>0) stopsave--;
					startdrag = 0;
				}
			});
			if(stopsave>0) stopsave--;
			startdrag = 0;
		}
	});
	// 左侧组件样式允许拖入右侧布局中的列（.column）
	$(".sidebar-nav .box").draggable({
		connectToSortable: ".column",
		helper: "clone",
		handle: ".drag", // 拖动手柄
		start: function(e,t) {
			if (!startdrag) stopsave++;
			startdrag = 1;
		},
		drag: function(e, t) {
			t.helper.width(400)
		},
		stop: function() {
			// 处理各种ids
			handleJsIds();
			if(stopsave>0) stopsave--;
			startdrag = 0;
		}
	});

	// 初始化容器
	initContainer();

	// 绑定模板元素的编辑按钮，打开编辑弹窗
	$('body.edit .demo').on("click","[data-target=#editorModal]",function(e) {
		e.preventDefault();
		// 获取实际dom
		currenteditor = $(this).parent().parent().find('.view');
		var eText = currenteditor.html();
		// html源码传入 CKEDITOR 编辑器
		contenthandle.setData(eText);
	});
	// 绑定编辑弹窗的保存按钮
	$("#savecontent").click(function(e) {
		e.preventDefault();
		// 从 CKEDITOR 获取编辑后的html源码
		currenteditor.html(contenthandle.getData());
	});
	// 绑定顶部下载按钮，打开下载弹窗
	$("[data-target=#downloadModal]").click(function(e) {
		e.preventDefault();
		// 设置下载会话框中的源码
		downloadLayoutSrc();
	});
	// 绑定顶部保存按钮，打开保存弹窗
	$("[data-target=#shareModal]").click(function(e) {
		e.preventDefault();
		handleSaveLayout();
	});

	// $("#download").click(function() {
	// 	downloadLayout();
	// 	return false
	// });
	// $("#downloadhtml").click(function() {
	// 	downloadHtmlLayout();
	// 	return false
	// });

	// 绑定编辑按钮 添加 edit 样式
	$("#edit").click(function() {
		$("body").removeClass("devpreview sourcepreview");
		$("body").addClass("edit");
		removeMenuClasses();
		$(this).addClass("active");
		return false
	});
	// 绑定布局编辑 添加 devpreview 样式
	$("#devpreview").click(function() {
		$("body").removeClass("edit sourcepreview");
		$("body").addClass("devpreview");
		removeMenuClasses();
		$(this).addClass("active");
		return false
	});
	// 绑定预览按钮 添加 devpreview sourcepreview 样式
	$("#sourcepreview").click(function() {
		$("body").removeClass("edit");
		$("body").addClass("devpreview sourcepreview");
		removeMenuClasses();
		$(this).addClass("active");
		return false
	});
	// 绑定清空按钮
	$("#clear").click(function(e) {
		e.preventDefault();
		clearDemo()
	});
	// 绑定下载弹窗中 自适应 按钮
	$("#fluidPage").click(function(e) {
		e.preventDefault();
		// 切换 container container-fluid 样式class
		changeStructure("container", "container-fluid");
		$("#fixedPage").removeClass("active");
		$(this).addClass("active");
		// 设置下载会话框中的源码
		downloadLayoutSrc()
	});
	// 绑定下载弹窗中 固定宽度 按钮
	$("#fixedPage").click(function(e) {
		e.preventDefault();
		// 切换 container container-fluid 样式class
		changeStructure("container-fluid", "container");
		$("#fluidPage").removeClass("active");
		$(this).addClass("active");
		// 设置下载会话框中的源码
		downloadLayoutSrc()
	});
	// 左侧菜单手风琴
	$(".nav-header").click(function() {
		$(".sidebar-nav .boxes, .sidebar-nav .rows").hide();
		$(this).next().slideDown()
	});
	// 绑定撤销
	$('#undo').click(function(){
		stopsave++; // 锁
		// 执行撤销 + 渲染
		if (undoLayout()) initContainer();
		stopsave--;
	});
	// 绑定重做
	$('#redo').click(function(){
		stopsave++; // 锁
		// 执行重做 + 渲染
		if (redoLayout()) initContainer();
		stopsave--;
	});
	// 事件委托绑定元素删除按钮
	removeElm();
	// 绑定左侧栅格系统功能
	gridSystemGenerator();
	// 定时器自动保存
	setInterval(function() {
		handleSaveLayout()
	}, timerSave)
})
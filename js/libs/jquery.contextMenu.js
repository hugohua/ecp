define([], function() { return function(jQuery) {
  
/**code start**/
// jQuery Context Menu Plugin
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
//
// More info: http://abeautifulsite.net/2008/09/jquery-context-menu-plugin/
//
// Terms of Use
//
// This plugin is dual-licensed under the GNU General Public License
//   and the MIT License and is copyright A Beautiful Site, LLC.
//
;(function($){
	$.extend($.fn, {
		contextMenu: function(o, callback){
			// Defaults
			if (o.menu == undefined) 
				return false;
			if (o.inSpeed == undefined) 
				o.inSpeed = 150;
			if (o.outSpeed == undefined) 
				o.outSpeed = 75;
			// 0 needs to be -1 for expected results (no fade)
			if (o.inSpeed == 0) 
				o.inSpeed = -1;
			if (o.outSpeed == 0) 
				o.outSpeed = -1;
			// Loop each context menu
			$(this).each(function(){
				var el = $(this);
				var offset = $(el).offset();
				// Add contextMenu class
				$('#' + o.menu).addClass('mouse_right_click');
				// Simulate a true right click
				$(this).mousedown(function(e){
					var evt = e;
					evt.stopPropagation();
					$(this).mouseup(function(e){
						//绑定了draggable事件，发生冲突。
						//e.stopPropagation();
						var srcElement = $(this);
						$(this).unbind('mouseup');
						if (evt.button == 2) {
							// Hide context menus that may be showing
							$(".mouse_right_click").hide();
							// Get this context menu
							var menu = $('#' + o.menu);
							
							if ($(el).hasClass('disabled')) 
								return false;
							
							// Detect mouse position
							var d = {}, x, y;
							if (self.innerHeight) {
								d.pageYOffset = self.pageYOffset;
								d.pageXOffset = self.pageXOffset;
								d.innerHeight = self.innerHeight;
								d.innerWidth = self.innerWidth;
							}
							else 
								if (document.documentElement &&
								document.documentElement.clientHeight) {
									d.pageYOffset = document.documentElement.scrollTop;
									d.pageXOffset = document.documentElement.scrollLeft;
									d.innerHeight = document.documentElement.clientHeight;
									d.innerWidth = document.documentElement.clientWidth;
								}
								else 
									if (document.body) {
										d.pageYOffset = document.body.scrollTop;
										d.pageXOffset = document.body.scrollLeft;
										d.innerHeight = document.body.clientHeight;
										d.innerWidth = document.body.clientWidth;
									}
							(e.pageX) ? x = e.pageX : x = e.clientX + d.scrollLeft;
							(e.pageY) ? y = e.pageY : y = e.clientY + d.scrollTop;
							
							// Show the menu
							$(document).unbind('click');
							$(menu).css({
								top: y,
								left: x
							}).fadeIn(o.inSpeed);
							//hugo add
							$(srcElement).addClass("editing_area").siblings().removeClass("editing_area");
							
							var $menu = $('#' + o.menu);
							//判断是否多选
							if($(srcElement).hasClass("ui-multidraggable")){
								//已多选
								$menu.enableContextMenuItems('#cancel_select,#a_left,#a_top').disableContextMenuItems('#select');
							}else{
								$menu.enableContextMenuItems('#select').disableContextMenuItems('#cancel_select,#a_left,#a_top');
							}
							
							// When items are selected
							$('#' + o.menu).find('A').unbind('click');
							$('#' + o.menu).find('LI:not(.disabled) A').click(function(){
								$(document).unbind('click').unbind('keypress');
								$(".mouse_right_click").hide();
								// Callback
								if (callback) 
									callback($(this).attr('href').substr(1), $(srcElement), {
										x: x - offset.left,
										y: y - offset.top,
										docX: x,
										docY: y
									});
								return false;
							});
							
							// Hide bindings
							setTimeout(function(){ // Delay for Mozilla
								$(document).click(function(){
									$(document).unbind('click').unbind('keypress');
									$(menu).fadeOut(o.outSpeed);
									return false;
								});
							}, 0);
						}
					});
				});
				
				// Disable text selection
				if ($.browser.mozilla) {
					$('#' + o.menu).each(function(){
						$(this).css({
							'MozUserSelect': 'none'
						});
					});
				}
				else 
					if ($.browser.msie) {
						$('#' + o.menu).each(function(){
							$(this).bind('selectstart.disableTextSelect', function(){
								return false;
							});
						});
					}
					else {
						$('#' + o.menu).each(function(){
							$(this).bind('mousedown.disableTextSelect', function(){
								return false;
							});
						});
					}
				// Disable browser context menu (requires both selectors to work in IE/Safari + FF/Chrome)
			
			
			});
			return $(this);
		},
		disableContextMenuItems: function(o) {
			if( o == undefined ) {
				// Disable all
				$(this).find('LI').addClass('disabled');
				return( $(this) );
			}
			$(this).each( function() {
				if( o != undefined ) {
					var d = o.split(',');
					for( var i = 0; i < d.length; i++ ) {
						$(this).find('A[href="' + d[i] + '"]').parent().addClass('disabled');
						
					}
				}
			});
			return( $(this) );
		},
		
		// Enable context menu items on the fly
		enableContextMenuItems: function(o) {
			if( o == undefined ) {
				// Enable all
				$(this).find('LI.disabled').removeClass('disabled');
				return( $(this) );
			}
			$(this).each( function() {
				if( o != undefined ) {
					var d = o.split(',');
					for( var i = 0; i < d.length; i++ ) {
						$(this).find('A[href="' + d[i] + '"]').parent().removeClass('disabled');
						
					}
				}
			});
			return( $(this) );
		}
	});
})(jQuery);

/**code end**/
  
  
}});



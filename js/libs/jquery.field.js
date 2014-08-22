define([], function() { return function(jQuery) {
  
/**code start**/
/*
 * jQuery Field Plug-in
 *
 * Copyright (c) 2007 Dan G. Switzer, II
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function($) {
	var defaults = {
		delimiter: ","
	};
	     
	$.fn.getValue = function(){
		// return the values as a comma-delimited string
		return getValue(this).join(defaults.delimiter);
	};	
	
	/**
	 * 清除表单默认值
	 */
	$.fn.clearForm = function() {
	  return this.each(function() {
	    var type = this.type, tag = this.tagName.toLowerCase();
	    if (tag == 'form')
	      return $(':input',this).clearForm();
	    if (type == 'text' || type == 'password' || type == 'hidden' || type == 'number' || tag == 'textarea' || type == 'color')
	      this.value = '';
	    else if (type == 'checkbox' || type == 'radio'){
			this.checked = false;
//			ulog.info($(this).closest("label"),'$(this).closest("label")')
//			$(this).closest("label").removeClass("bg_input_current");
		}
	    else if (tag == 'select')
	      this.selectedIndex = 0;  });
	};

	var getValue = function(jq){
		var v = [];

		jq.each(
			function (lc){
				// get the current type
				var t = getType(this);

				switch( t ){
					case "checkbox": case "radio":
						// if the checkbox or radio element is checked
						if( this.checked ) v.push(this.value);
					break;

					case "select":
						if( this.type == "select-one" ){
							v.push( (this.selectedIndex == -1) ? "" : getOptionVal(this[this.selectedIndex]) );
						} else {
							// loop through all element in the array for this field
							for( var i=0; i < this.length; i++ ){
								// if the element is selected, get the selected values
								if( this[i].selected ){
									// append the selected value, if the value property doesn't exist, use the text
									v.push(getOptionVal(this[i]));
								}
							}
						}
					break;

					case "text":
						v.push(this.value);
					break;
				}
			}
		);

		// return the values as an array
		return v;
	};

	$.fn.setValue = function(v){
		// f no value, set to empty string
		return setValue(this, ((!v && (v !== 0)) ? [""] : v.toString().split(defaults.delimiter)));
	};

	var setValue = function(jq, v){
		jq.each(
			function (lc){
				var t = getType(this), x;

				switch( t ){
					case "checkbox": case "radio":
						if( valueExists(v, this.value) ) this.checked = true;
						else this.checked = false;
					break;

					case "select":
						var bSelectOne = (this.type == "select-one");
						var bKeepLooking = true; // if select-one type, then only select the first value found
						// loop through all element in the array for this field
						for( var i=0; i < this.length; i++ ){
							x = getOptionVal(this[i]);
							bSelectItem = valueExists(v, x);
							if( bSelectItem ){
								this[i].selected = true;
								// if a select-one element
								if( bSelectOne ){
									// no need to look farther
									bKeepLooking = false;
									// stop the loop
									break;
								}
							} else if( !bSelectOne ) this[i].selected = false;
						}
						// if a select-one box and nothing selected, then try to select the default value
						if( bSelectOne && bKeepLooking && !!this[0] ){
							this[0].selected = true;
						}
					break;

					case "text":
						this.value = v.join(defaults.delimiter);
					break;
				}

			}
		);

		return jq;
	};
	
	// determines how to process a field
	var getType = function (el){
		var t = el.type;

		switch( t ){
			case "select": case "select-one": case "select-multiple":
				t = "select";
				break;
			case "text": case "hidden": case "textarea": case "password": case "button": case "submit": case "submit": case "number": case "color":
				t = "text";
				break;
			case "checkbox": case "radio":
				t = t;
				break;
		}
		return t;
	};
	
	// gets the value of a select element
	var getOptionVal = function (el){
		 return jQuery.browser.msie && !(el.attributes['value'].specified) ? el.text : el.value;
	};
	
	// checks to see if a value exists in an array
	var valueExists = function (a, v){
		return ($.inArray(v, a) > -1);
	};

})(jQuery);   
/**code end**/
  
  
}});



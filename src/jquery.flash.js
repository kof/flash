/*
 * flash - Plugin for jQuery
 * 
 * @depends: jquery.js
 * @version 1.4
 * @license Dual licensed under the MIT and GPL licenses.
 * @author  Oleg Slobodskoi aka Kof
 * @website http://jsui.de
 */

;(function($){

$.fn.flash = function( method, options ) {
    if ( typeof method != 'string' ) {
        options = method;
        method = null;
    }
    var s = $.extend(true, {}, $.flash.defaults, options);
    
    if ( s.checkVersion && !$.flash.checkVersion( s.version ) ) {
        s.error.call(this, 'wrong flash version');
        $.error('wrong flash version');     
    }
    
    var ret = this;
        
    this.each(function(){
        var instance = $.data(this, 'flash') || $.data( this, 'flash', new $.flash($(this), s) );
        method && (ret = instance[method](options));
    });
    
    return ret;
};

var timestamp =  (new Date).getTime();

$.flash = function( $elem, s ) {
    this.settings = s;

    // id is needed by ie if using external interface
    !s.attr.id && (s.attr.id = 'flash-' + timestamp++); 
    
    //serialize flashvars if object is given
    $.isPlainObject(s.params.flashvars) && (s.params.flashvars = $.param(s.params.flashvars));
    
    this._$elem = $elem;
    // save original html
    this._$originContent = $elem.html();
    
    !s.attr.width && (s.attr.width = $elem.width());
    !s.attr.height && (s.attr.height = $elem.height());
    
    var flash = '';    
    if ( $.browser.msie ) {
        s.params.movie = s.swf;
        //create param elements
        $.each(s.params, function(name, val){
            val && (flash+='<param name="'+name+'" value="'+val+'"/>');
        });
        flash = '<object '+ toAttr(s.attr) +' classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000">'+flash+'</object>';
    } else {
        s.attr.src = s.swf;
        flash = '<embed' + toAttr(s.params) + toAttr(s.attr) + '/>';
    }
    
    $elem[0].innerHTML = flash;
    this._flashElem = $elem[0].childNodes[0];
}

$.flash.defaults = {
    swf: null,
    version: '8.0.0',
    checkVersion: true,
    params: {
        scale: 'noscale',
        allowfullscreen: true,
        allowscriptaccess: 'always',
        quality: 'best',
        wmode: 'transparent',
        bgcolor: 'transparent',
        flashvars: null,
        menu: false
    },
    attr: {
        type: 'application/x-shockwave-flash',
        width: null,
        height: null
    },
    error: $.noop
};

$.flash.prototype = {
    destroy: function() {
        this._$elem.removeData('flash').html(this._$originContent);    
    },
    
    get: function() {
        return this._flashElem;
    }    
};

var playerVersion;
$.flash.checkVersion = function ( v ) {
    // cache player version detection
    var pv = playerVersion;
    
    if ( !pv ) {
        var descr, maxVersion = 11;
        
        //thats NS, Mozilla, Firefox        
        if (typeof navigator.plugins['Shockwave Flash'] == 'object') {
            descr = navigator.plugins['Shockwave Flash'].description;
            descr = descr.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
            pv = [
                descr.replace(/^(.*)\..*$/, "$1"),
                descr.replace(/^.*\.(.*)\s.*$/, "$1"),
                /r/.test(descr) ? descr.replace(/^.*r(.*)$/, "$1") : 0
            ];
        //thats IE    
        } else if ( typeof ActiveXObject == 'function') {
            var ao;
            for(var i = maxVersion; i >= 2; i--) {
                try {
                    ao = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.' + i);
                    if ( typeof ao == 'object' ) {
                        descr = ao.GetVariable('$version'); 
                        break;
                    }
               } catch(e){};
            }
            
            pv = descr.split(' ')[1].split(',');
        }
        
        if ( !pv && v ) return false;
                    
        v = toInt( v.split('.') );
        playerVersion = pv = toInt( pv );
    }
    
    return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
}


function toInt (arr) {    
    return $.map(arr, function(n, i){
        return parseInt(n, 10);
    });
}

function toAttr(obj) {
    var str = '';
    for (var key in obj ) {
        str += ' ' + key + '="' + obj[key] + '"'
    }
    return str;
}

})(jQuery);        

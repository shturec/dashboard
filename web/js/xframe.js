document.querySelector("body > div[ui-view]").style["overflow-y"] = "auto";
window.addEventListener("message", function (e) {
	if(e.origin !== location.origin){
    	return; 
    }
    var message = e.data;
    if(message.height){
    	document.querySelector("body > div[ui-view]").style["overflow-y"] = "auto";
    	document.querySelector("body .content-frame").style.height = message.height + "px";
    	document.querySelector("body .content-frame").style["min-height"] = message.height + "px";
    }
}, false);

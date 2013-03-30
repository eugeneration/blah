// requestAnimationFrame shim
(function() {
 var i = 0,
 lastTime = 0,
 vendors = ['ms', 'moz', 'webkit', 'o'];
 
 while (i < vendors.length && !window.requestAnimationFrame) {
 window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
 i++;
 }
 
 if (!window.requestAnimationFrame) {
 window.requestAnimationFrame = function(callback, element) {
 var currTime = new Date().getTime(),
 timeToCall = Math.max(0, 1000 / 60 - currTime + lastTime),
 id = setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
 
 lastTime = currTime + timeToCall;
 return id;
 };
 }
 }());

var App = {
start: function(stream) {
    //App.video.addEventListener('canplay', function() {
    //App.video.removeEventListener('canplay');
    setTimeout(function() {
               //App.video.play();
               App.canvas.style.display = 'inline';
               App.info.style.display = 'none';
               App.canvas.width = App.video.videoWidth;
               App.canvas.height = App.video.videoHeight;
               App.backCanvas.width = App.video.videoWidth / 4;
               App.backCanvas.height = App.video.videoHeight / 4;
               App.backContext = App.backCanvas.getContext('2d');
               
               var w = 300 / 4 * 0.8,
               h = 270 / 4 * 0.8;
               
               App.comp = [{
                           x: (App.video.videoWidth / 4 - w) / 2,
                           y: (App.video.videoHeight / 4 - h) / 2,
                           width: w,
                           height: h,
                           }];
               App.drawToCanvas();
               }, 500);
    //}, true);
    
    //var domURL = window.URL || window.webkitURL;
    //App.video.src = domURL ? domURL.createObjectURL(stream) : stream;
},
denied: function() {
    App.info.innerHTML = 'Camera access denied!<br>Please reload and try again.';
},
error: function(e) {
    if (e) {
        console.error(e);
    }
    App.info.innerHTML = 'Please go to about:flags in Google Chrome and enable the &quot;MediaStream&quot; flag.';
},
drawToCanvas: function() {
    
    requestAnimationFrame(App.drawToCanvas);
    
    var video = App.video,
    ctx = App.context,
    backCtx = App.backContext,
    m = 4,
    w = 4,
    i,
    comp;
    
    ctx.drawImage(video, 0, 0, App.canvas.width, App.canvas.height);
    
    backCtx.drawImage(video, 0, 0, App.backCanvas.width, App.backCanvas.height);
    
    comp = ccv.detect_objects(App.ccv = App.ccv || {
                              canvas: App.backCanvas,
                              cascade: cascade,
                              interval: 4,
                              min_neighbors: 1
                              });
    
    if (comp.length) {
        App.comp = comp;
    }
    
    var fontSize = 30;
    
    for (i = App.comp.length; i--; ) {
        ctx.drawImage(App.glasses, (App.comp[i].x - w / 2) * m, (App.comp[i].y - App.comp[i].height/1.3 - w / 2) * m, (App.comp[i].width + w) * m, (App.comp[i].height + w) * m);
        
        ctx.scale(-1,1);
        ctx.translate(-(App.comp[i].x + App.comp[i].width - w / 2) * m , 0);
        ctx.fillText(App.personText, 0, (App.comp[i].y -  w / 2) * m);
        ctx.translate((App.comp[i].x + App.comp[i].width - w / 2) * m , 0);
        ctx.scale(-1,1);
        
        fontSize = Math.floor((App.comp[i].height/2)/(App.personText.length/13));
        
        ctx.font = (fontSize  +  "px Arial");
    }
}
};

App.glasses = new Image();
App.glasses.src = 'postit.png';

App.init = function(pT) {
    App.video = document.querySelector('#publisher video');
    App.backCanvas = document.createElement('canvas');
    App.canvas = document.querySelector('#output');
    App.canvas.style.display = 'none';
    App.context = App.canvas.getContext('2d');
    App.info = document.querySelector('#info');
    App.personText = pT;
    App.start();
    
    //navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    
    //try {
    //            navigator.getUserMedia_({
    //		video: true,
    //		audio: false
    //	}, App.start, App.denied);
    //} catch (e) {
    //	try {
    //		navigator.getUserMedia_('video', App.start, App.denied);
    //	} catch (e) {
    //		App.error(e);
    //	}
    //}
    
    //App.video.loop = App.video.muted = true;
    //App.video.load();
};

App.face = {
    
    "begin" : function(sID, aKey, toke, name) {
        var sessionId = sID;
        var apiKey = aKey;
        var token = toke;
        
        var session = TB.initSession(sessionId);
        
        session.addEventListener('sessionConnected', function(e) {
                                 console.log('session connected');
                                 session.publish('publisher');
                                 });
        
        session.addEventListener('streamCreated', function(e) {
                                 var stream;
                                 for (var i = 0; i < e.streams.length; i++) {
                                 stream = e.streams[i];
                                 // make sure this is my own stream
                                 if (stream.connection.connectionId === session.connection.connectionId) {
                                 //console.log('app init going to be called');
                                 App.init(name);
                                 }
                                 }
                                 });
        
        session.connect(apiKey, token);
    }
};

var akey = "24401322";
var s = "1_MX4yNDQwMTMyMn4xMjcuMC4wLjF-U2F0IE1hciAzMCAwOTo1NjozOSBQRFQgMjAxM34wLjY1MDE5MzJ-";
var t="T1==cGFydG5lcl9pZD0yNDQwMTMyMiZzZGtfdmVyc2lvbj10YnJ1YnktdGJyYi12MC45MS4yMDExLTAyLTE3JnNpZz01NTBhYTg4YTMwYzlkNWZlYzM5MzdiMDE3Njk1NTg2OWUyOWU4ZWYxOnJvbGU9cHVibGlzaGVyJnNlc3Npb25faWQ9MV9NWDR5TkRRd01UTXlNbjR4TWpjdU1DNHdMakYtVTJGMElFMWhjaUF6TUNBd09UbzFOam96T1NCUVJGUWdNakF4TTM0d0xqWTFNREU1TXpKLSZjcmVhdGVfdGltZT0xMzY0NjYyNjA2Jm5vbmNlPTAuNDA5NTAzMjk1MjI2MTMxNSZleHBpcmVfdGltZT0xMzY0NzQ5MDA5JmNvbm5lY3Rpb25fZGF0YT0=";
App.face.begin(s , akey, t, "Oprah The Fatty", TB);

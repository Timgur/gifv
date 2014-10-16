var GifVProto = Object.create(HTMLImageElement.prototype);

GifVProto.createdCallback = function() {
    this.shadow = this.createShadowRoot();
    this.shadow.appendChild(this.createTemplate({
        type: this.playType(), 
        file: this.attributes.src.value.split('.gif')[0], 
        loop: (this.attributes.noloop) ? false : true
    }));
};

GifVProto.detachedCallback = function() {
    this.removeVideoElements();
    this.shadow.innerHTML = '';
    this.shadow = undefined;
};

GifVProto.removeVideoElements = function() {
    if(this.refresh) { 
        this.refresh.removeEventListener('click');
        this.shadow.removeChild(this.refresh);
        this.refresh = undefined;
    }; 

    this.vid.removeEventListener('onerror');
    this.shadow.removeChild(this.vid);
    this.vid = undefined;
};

GifVProto.errorCallback = function(opts) {
    this.removeVideoElements();
    this.shadow.appendChild(this.imageFallback(opts));
};

GifVProto.createTemplate = function(opts) {
    if(opts.type == 'gif') {
        return this.imageFallback(opts);
    }

    var fragment = document.createDocumentFragment();
    this.vid = document.createElement('video');
    var self = this;

    this.vid.src = opts.file + '.' + opts.type;
    this.vid.loop = opts.loop;
    this.vid.muted = true;
    this.vid.autoplay = true;

    this.vid.onerror = function() {
        self.errorCallback.call(self, opts);
    }

    fragment.appendChild(this.vid);

    if(!opts.loop) {
        this.refresh = this.addRefreshButton();
        fragment.appendChild(this.refresh);
    }

    return fragment;
};

GifVProto.imageFallback = function(opts) {
    var img = new Image();
    img.src = opts.file + '.gif';
    return img;
}

GifVProto.canPlayVideo = function() {
    return !!document.createElement('video').canPlayType;
};

GifVProto.playType = function() {
    var testEl = document.createElement('video'), mpeg4, h264, ogg, webm;

    if(testEl.canPlayType) {
        // Check for MPEG-4 support
        mpeg4 = "" !== testEl.canPlayType( 'video/mp4; codecs="mp4v.20.8"' );

        // Check for h264 support
        h264 = "" !== ( testEl.canPlayType( 'video/mp4; codecs="avc1.42E01E"' )
            || testEl.canPlayType( 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"' ) );

        // Check for Ogg support
        ogg = "" !== testEl.canPlayType( 'video/ogg; codecs="theora"' );

        // Check for Webm support
        webm = "" !== testEl.canPlayType( 'video/webm; codecs="vp8, vorbis"' );
    }

    if(webm) {
        return 'webm';
    } else if(h264 || mpeg4) {   
        return 'mp4';
    } else if(ogg) {
        return 'ogg';
    } else {
        return 'gif';
    }
};

GifVProto.addRefreshButton = function() {
    var self = this;
    var refresh = document.createElement('img');
    refresh.src = "img/refresh.png";
    refresh.style.display = 'block';
    refresh.style.marginTop = '-40px';
    refresh.style.marginLeft = '10px';
    refresh.style.zIndex = '100';
    refresh.style.width = '25px';
    refresh.style.position = 'absolute';
    refresh.style.cursor = 'pointer';

    refresh.addEventListener('click', function() {
        self.vid.currentTime = 0;
        self.vid.play();
    });

    return refresh;
};

var GifV = document.registerElement('gif-v', {prototype: GifVProto});

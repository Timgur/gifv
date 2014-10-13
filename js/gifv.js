var GifVProto = Object.create(HTMLImageElement.prototype);

GifVProto.createdCallback = function() {
    var shadow = this.createShadowRoot();
    shadow.appendChild(this.createTemplate({
        type: this.playType(), 
        file: this.attributes.src.value.split('.gif')[0], 
        loop: (this.attributes.noloop) ? false : true
    }));
};

GifVProto.detachedCallback = function() {
    if(this.refresh) { this.refresh.removeEventListener('click'); }
};

GifVProto.createTemplate = function(opts) {
    var self = this;
    var fragment = document.createDocumentFragment();
    if (this.canPlayVideo()) {
        this.vid = document.createElement('video');
        this.vid.src = opts.file + '.' + opts.type;
        this.vid.loop = opts.loop;
        this.vid.autoplay = true;

        fragment.appendChild(this.vid);

        if(!opts.loop) {
            this.refresh = this.addRefreshButton();
            fragment.appendChild(this.refresh);

            this.refresh.addEventListener('click', function() {
                self.vid.currentTime = 0;
                self.vid.play();
            });
        }
        return fragment;
    } else {
        var img = new Image();
        img.src = opts.file + '.gif';
        return img;
    }
};

GifVProto.canPlayVideo = function() {
    return !!document.createElement('video').canPlayType;
};

GifVProto.playType = function() {
    var testEl = document.createElement('video'), h264, webm;

    // Check for h264 support
    h264 = "" !== ( testEl.canPlayType( 'video/mp4; codecs="avc1.42E01E"' )
        || testEl.canPlayType( 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"' ) );

    // Check for Webm support
    webm = "" !== testEl.canPlayType( 'video/webm; codecs="vp8, vorbis"' );

    if(webm) {
        return 'webm';
    } else if(h264) {   
        return 'mp4';
    } else {
        return 'gif';
    }
};

GifVProto.addRefreshButton = function() {
    var refresh = document.createElement('img');
    refresh.src = "img/refresh.png";
    refresh.style.display = 'block';
    refresh.style.marginTop = '-40px';
    refresh.style.marginLeft = '10px';
    refresh.style.zIndex = '100';
    refresh.style.width = '25px';
    refresh.style.position = 'absolute';
    refresh.style.cursor = 'pointer';

    return refresh;
};

var GifV = document.registerElement('gif-v', {prototype: GifVProto});

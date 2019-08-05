import { __assign } from 'tslib';

var MusicVisualization = /** @class */ (function () {
    function MusicVisualization(options) {
        var _this = this;
        this.options = __assign({ src: '', gap: 0, minHeight: 10, onPlay: function () { }, onStop: function () { }, audioEvents: {} }, options);
        this.drawRafId = null;
        this.objectUrl = '';
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas = this.createCanvas(this.width, this.height);
        this.canvasCtx = this.canvas.getContext('2d');
        this.container = this.createDomContainer(this.canvas);
        document.body.appendChild(this.container);
        this.analyser = null;
        this.audio = this.createAudio();
        if (this.options.audioEvents) {
            Object.keys(this.options.audioEvents).forEach(function (key) {
                _this.audio.addEventListener(key, _this.options.audioEvents[key]);
            });
        }
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
    }
    MusicVisualization.prototype.start = function () {
        var _this = this;
        if (!this.audio.src) {
            return;
        }
        // playing
        if (!this.audio.paused && this.audio.duration > 0) {
            return;
        }
        if (!this.analyser) {
            this.analyser = this.createAnalyser(this.audio);
        }
        return this.audio.play().then(function () {
            if (_this.options.onPlay) {
                _this.options.onPlay();
            }
            _this.draw();
        });
    };
    MusicVisualization.prototype.stop = function () {
        if (this.drawRafId) {
            window.cancelAnimationFrame(this.drawRafId);
            this.drawRafId = null;
        }
        this.audio.pause();
        if (this.options.onStop) {
            this.options.onStop();
        }
    };
    MusicVisualization.prototype.destroy = function () {
        var _this = this;
        this.stop();
        if (this.objectUrl) {
            window.URL.revokeObjectURL(this.objectUrl);
        }
        if (this.options.audioEvents) {
            Object.keys(this.options.audioEvents).forEach(function (key) {
                _this.audio.removeEventListener(key, _this.options.audioEvents[key]);
            });
        }
        window.removeEventListener('resize', this.handleResize);
        document.body.removeChild(this.container);
        this.analyser = null;
    };
    MusicVisualization.prototype.changeMusic = function (file) {
        if (this.objectUrl) {
            window.URL.revokeObjectURL(this.objectUrl);
        }
        this.objectUrl = window.URL.createObjectURL(file);
        this.stop();
        this.audio.src = this.objectUrl;
        this.start();
    };
    MusicVisualization.prototype.handleResize = function () {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    };
    /**
     * 创建DOM
     * @param canvas
     */
    MusicVisualization.prototype.createDomContainer = function (canvas) {
        var container = document.createElement('div');
        container.className = 'music-container';
        container.style.cssText =
            'position: fixed; left: 0; bottom: 0; width: 100%; height: 100%; pointer-events: none;';
        container.appendChild(canvas);
        return container;
    };
    /**
     *  创建canvas
     */
    MusicVisualization.prototype.createCanvas = function (width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    };
    /**
     * 创建audio
     */
    MusicVisualization.prototype.createAudio = function () {
        var audio = new Audio();
        audio.src = this.options.src;
        audio.preload = 'auto';
        audio.volume = 0.8;
        audio.loop = true;
        audio.crossOrigin = 'anonymous';
        return audio;
    };
    /**
     * 创建auido 分析器
     * @param audio
     */
    MusicVisualization.prototype.createAnalyser = function (audio) {
        var audioCtx = new (AudioContext || webkitAudioContext)();
        var source = audioCtx.createMediaElementSource(audio);
        var analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 256;
        return analyser;
    };
    /**
     * 画曲线
     * @param param0
     */
    MusicVisualization.prototype.drawCurveLine = function (_a) {
        var startX = _a.startX, startY = _a.startY, stopX = _a.stopX, stopY = _a.stopY, scaleY = _a.scaleY, arr = _a.arr;
        var _b = this, height = _b.height, canvasCtx = _b.canvasCtx;
        var minHeight = this.options.minHeight;
        var len = arr.length;
        var sliceWidth = stopX / (len - 1);
        var lastX = startX;
        var lastY = startY;
        for (var index = 0; index < len - 1; index++) {
            var x = lastX + sliceWidth;
            var y = ((height / 3) * (arr[index] / 256) + minHeight) * scaleY;
            // 取当前点 和 上一个点的中点, 模拟曲线
            var middleX = (lastX + x) / 2;
            var middleY = (lastY + y) / 2;
            canvasCtx.quadraticCurveTo(lastX, lastY, middleX, middleY);
            lastX = x;
            lastY = y;
        }
        canvasCtx.quadraticCurveTo(lastX, lastY, stopX, stopY * scaleY);
    };
    MusicVisualization.prototype.drawGraph = function (arr) {
        var canvasCtx = this.canvasCtx;
        var _a = this.options, minHeight = _a.minHeight, gap = _a.gap;
        var singleWidth = this.width / 2 - gap;
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, 0);
        canvasCtx.lineTo(0, minHeight);
        this.drawCurveLine({
            startX: 0,
            startY: minHeight,
            stopX: singleWidth,
            stopY: minHeight,
            scaleY: 1,
            arr: arr
        });
        canvasCtx.lineTo(singleWidth, 0);
        canvasCtx.fill();
    };
    MusicVisualization.prototype.drawLine = function (arr) {
        var canvasCtx = this.canvasCtx;
        var _a = this.options, gap = _a.gap, minHeight = _a.minHeight;
        var singleWidth = this.width / 2 - gap;
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, 0);
        this.drawCurveLine({
            startX: 0,
            startY: minHeight,
            stopX: singleWidth,
            stopY: minHeight,
            scaleY: 1.1,
            arr: arr
        });
        canvasCtx.stroke();
    };
    MusicVisualization.prototype.draw = function () {
        if (!this.analyser) {
            return;
        }
        var _a = this, analyser = _a.analyser, canvasCtx = _a.canvasCtx, width = _a.width, height = _a.height;
        var gap = this.options.gap;
        var singleWidth = this.width / 2 - gap;
        var bufferLength = analyser.frequencyBinCount - 5;
        var dataArray = new Uint8Array(bufferLength).slice(0, -20);
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.clearRect(0, 0, width, height);
        var gradientLeft = canvasCtx.createLinearGradient(0, 0, singleWidth, 0);
        gradientLeft.addColorStop(0, '#ff30a2');
        gradientLeft.addColorStop(1, '#d8db31');
        var gradientRight = canvasCtx.createLinearGradient(0, 0, singleWidth, 0);
        gradientRight.addColorStop(0, '#00cf2e');
        gradientRight.addColorStop(1, '#3bddd2');
        // 镜像 翻转 左边
        canvasCtx.save();
        canvasCtx.transform(1, 0, 0, -1, 0, height);
        canvasCtx.fillStyle = gradientLeft;
        canvasCtx.strokeStyle = gradientLeft;
        this.drawGraph(dataArray);
        this.drawLine(dataArray);
        canvasCtx.restore();
        // 镜像再 翻转 右边
        canvasCtx.save();
        canvasCtx.transform(-1, 0, 0, -1, width, height);
        canvasCtx.fillStyle = gradientRight;
        canvasCtx.strokeStyle = gradientRight;
        this.drawGraph(dataArray);
        this.drawLine(dataArray);
        canvasCtx.restore();
        this.drawRafId = requestAnimationFrame(this.draw.bind(this));
    };
    return MusicVisualization;
}());

export default MusicVisualization;
//# sourceMappingURL=index.es.js.map
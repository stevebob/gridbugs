const STAY = 0;
const DOWN = 1;
const UP = 2;

function Control() {
    this.threshold = 2;
    this.value = 1;
    this.value_window = new Array(10);
    for (var i = 0;i<this.value_window.length;++i) {
        this.value_window[i] = STAY;
    }
    this.idx = 0;
    this.smoothed_control = STAY;
}

Control.prototype.add_to_window = function(ctrl) {
    this.value_window[this.idx] = ctrl;
    this.idx = (this.idx + 1) % this.value_window.length;
}

Control.prototype.weight = function() {
    return 1/this.value;
}

Control.prototype.most_frequent = function() {
    var counts = [];
    counts[UP] = 0;
    counts[DOWN] = 0;
    counts[STAY] = 0;

    for (var i in this.value_window) {
        counts[this.value_window[i]]++;
    }

    var max = 0;
    var best;
    for (var i = 0;i<3;++i) {
        if (max < counts[i]) {
            max = counts[i];
            best = i;
        }
    }
    return best;
}

Control.prototype.update = function(a, b) {
    this.value = (a/b);
    var ctrl = this.simple_control();
    this.add_to_window(ctrl);
    this.smoothed_control = this.most_frequent();
}

Control.prototype.simple_control = function() {
    if (this.value > this.threshold) {
        return DOWN;
    } else if (this.value < 1/this.threshold) {
        return UP;
    }
    return STAY;
}

Control.prototype.get_control = function() {
    return this.smoothed_control;
}

function arr_min(arr, low, high) {
    var min = Infinity;
    for (var i = low;i<high;++i) {
        min = Math.min(arr[i], min);
    }
    return min;
}

const NUM_SAMPLES = 1024;
const NUM_ANALYSERS = 3;

var buf = new Uint8Array(NUM_SAMPLES);
var graphers = [];

var gains = [0, 12, 12, 1];

var colours = ["blue", "green", "red", "purple"];

var analysers = [];

function display(text) {
    $("#output").html(text);
}

function get_filter_with_order(ctx, type, freq, q, order, source) {
    var bandpass = source;
    for (var i = 0;i<order;++i) {
        
        var new_bandpass = ctx.createBiquadFilter();
        new_bandpass.type = type;
        new_bandpass.frequency.value = freq;
        new_bandpass.Q.value = q;
        bandpass.connect(new_bandpass);

        bandpass = new_bandpass;
    }
    
    return bandpass;
}

function signal_avg(signal) {
    var sum = 0;
    for (var i in signal) {
        var pt = signal[i]-128;
        sum += Math.abs(pt);
    }
    return sum/signal.length;
}

function format_avg(avg) {
    return Math.floor(avg);
}

var start_mic = function() {
    var cu = new CanvasUtil();
    console.debug($('#graph')[0]);
    cu.register_canvas($('#graph')[0]);
    cu.canvas.width = $(window).width();
    cu.canvas.height = $(window).height();

    for (var i = 0;i<NUM_ANALYSERS;++i) {
        graphers[i] = new Grapher(cu.ctx);
        graphers[i].set_range(0, i * cu.canvas.height / NUM_ANALYSERS, cu.canvas.width, cu.canvas.height/NUM_ANALYSERS);
    }
    
    // resolve any cross browser differences
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = 
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia;

    var control = new Control();
    var running_avg = 0;

    var update = function() {

        var a, b;

        for (var i = 0;i<NUM_ANALYSERS;++i) {

            for (var j = 0;j<buf.length;++j) {
                buf[j]=0;
            }
            graphers[i].clear();
            analysers[i].getByteFrequencyData(buf);

            graphers[i].graph_data(buf, 0.5, 50, "black", 2, buf.length/2);
            analysers[i].getByteTimeDomainData(buf);
            graphers[i].graph_data(buf, 1, 128, colours[i], 2);
            if (i == 1) {
                a = signal_avg(buf);
            } else if (i == 2) {
                b = signal_avg(buf);
            } else if (i == 0) {
                var sample_avg = signal_avg(buf);
                
            }
        }


        control.update(a, b);
        display(control.get_control() + " " + control.value);

        setTimeout(update, 30);
    }
    
    var error = function(){console.log("Could not get stream from audio input.")};
 
    var filter_region = function(ctx, low, high, g, order, source) {
//        var lowpass = get_filter_with_order(ctx, "lowpass", high, 0, order, source);

//        var highpass = get_filter_with_order(ctx, "highpass", low, 0, order, lowpass);
 
        var highpass = get_filter_with_order(ctx, "bandpass", (low + high)/2, 2, order, source);
        
        var gain = ctx.createGain();
        gain.gain.value = g;
        highpass.connect(gain);

        return gain;
    }

    var success = function(stream) {
        var ctx = new AudioContext();
        var media_stream_source = ctx.createMediaStreamSource(stream);
        
        /*
        analyser = ctx.createAnalyser();
        analyser.fftSize = NUM_SAMPLES;
        media_stream_source.connect(analyser);
        console.debug(analyser);
        */

         // create analyser
        var analyser = ctx.createAnalyser();
        analyser.fftSize = NUM_SAMPLES;
        media_stream_source.connect(analyser);

        analysers.push(analyser);
        
        var filter = filter_region(ctx, 200, 250, 5, 10, media_stream_source);
        analyser = ctx.createAnalyser();
        analyser.fftSize = NUM_SAMPLES;
        filter.connect(analyser);
        analysers.push(analyser);
        
        filter = filter_region(ctx, 300, 350, 5, 10, media_stream_source);
        analyser = ctx.createAnalyser();
        analyser.fftSize = NUM_SAMPLES;
        filter.connect(analyser);
        analysers.push(analyser);



        update();
    };

    navigator.getUserMedia({audio:true}, success, error);

    return control;
}

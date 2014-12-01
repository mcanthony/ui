var getSet   = require('utils').getSet;
var uniqueId = require('utils').uniqueId;
var LayerVis = require('layer-vis');
var pck      = require('./package.json');
var fs       = require('fs');
var renderingStrategies = require('./lib/rendering-strategies');
var minMax   = require('./lib/min-max');

// for test purpose - must be removed
var _ = require('underscore');

'use strict';

// @NOTES / TODOS:
// - from: http://www.bbc.co.uk/rd/blog/2013/10/audio-waveforms
//   audacity creates a cached down sampled version of min / max values
//   the window size has 256 samples
// > if samplesPerPIxels > 256 parse data from downsampled extract
// > else parse raw data
//   should improve perf when zoomed out
//   use cached data in zoom in / define what to do on zoom out
//
// - webwroker use create a creepy flicking issue due to asynchrony
//   and is actually not usable - we must find a workaround for that problem
// > maybe define an incremental index for each call and ignore any 
//   response that would have a smaller index
//
// - throttle 
//    -> define where it must be implemented
//
// - how to integrate "native" d3 component with the rAF loop

var workerBlob = new Blob(
  [fs.readFileSync(__dirname + '/lib/resampler-worker.js', 'utf-8')],
  { type: 'text/javascript' }
);

class WaveformVis extends LayerVis {
  constructor() {
    if (!(this instanceof WaveformVis)) { return new WaveformVis; }

    super();

    var name = pck.name.replace('-vis', '');

    var defaults = {
      type: name,
      id: uniqueId(name),
      renderingStrategy: 'svg',
      yDomain: [-1, 1], // default yDomain for audioBuffer
      triggerUpdateZoomDelta: 0.05,
      triggerUpdateDragDelta: 4,
      useWorker: false
    };

    this.params(defaults);
    this.color('#000000');
    this.sampleRate(44100);
    // init zoom factor to 1
    this.currentZoomFactor = 1;
    this.currentDragDeltaX = 0;

    // debounce xZoom call
    // this.xZoom = _.throttle(this.xZoom, 50);
    // console.log(this.xZoom);
  }

  // get number of sample per timeline pixels - aka. windowSize
  getSamplesPerPixel() {
    var timelineDomain = this.base.xScale.domain();
    var timelineDuration = timelineDomain[1] - timelineDomain[0];
    var timelineWidth = this.base.width();
    var sampleRate = this.sampleRate();

    return (timelineDuration * sampleRate()) / timelineWidth;
  }

  onload() {
    // bind rendering strategy
    var strategy = renderingStrategies[this.param('renderingStrategy')];
    this._update = strategy.update.bind(this);
    this._draw   = strategy.draw.bind(this);

    // create partial xxScale
    this.xxScale = this.d3.scale.linear()
      .range([0, this.duration()()]);

    // init worker
    if (this.param('useWorker')) { this.initWorker(); }
  }

  initWorker() {
    this.resampler = new Worker(window.URL.createObjectURL(workerBlob));
    var onResponse = this.resamplerResponse.bind(this);
    this.resampler.addEventListener('message', onResponse, false);
    // an index to prevent drawing to "come back" in time - fix async problem
    this.__currentWorkerCallTime = 0;

    var message = {
      cmd: 'initialize',
      buffer: this.data(),
      minMax: minMax.toString()
    };

    this.resampler.postMessage(message, [message.buffer]);
  }

  // call the resampler worker or online minMax 
  // according to `this.param('useWorker')`
  downSample() {
    var range = this.base.xScale.range();
    var width = range[1] - range[0];
    var extractAtTimes = [];

    // if (this.__isProcessing) { return; }
    // this.__isProcessing = true;

    // define all times where a minMax snapshot must be done
    for (let pixel = 0; pixel < width; pixel++) {
      var timelineTimeStart = this.base.xScale.invert(pixel);
      extractAtTimes.push(timelineTimeStart);
    }

    // define center of the y domain for default values
    var yDomain = this.yScale.domain(); // not this
    var defaultValue = (yDomain[0] + yDomain[1]) / 2;
    var sampleRate = this.sampleRate()();
    var windowSize = this.getSamplesPerPixel();

    console.time('downsample');

    if (this.param('useWorker')) {
      var message = {
        cmd: 'downSample',
        time: new Date().getTime(),
        extractAtTimes: extractAtTimes,
        sampleRate: sampleRate,
        windowSize: windowSize,
        defaultValue: defaultValue
      };

      this.resampler.postMessage(message);
    } else {
      var data = this.data();
      var buffer = data instanceof ArrayBuffer ? new Float32Array(data) : data;

      var downSampledView = minMax(
        buffer, 
        extractAtTimes, 
        sampleRate, 
        windowSize, 
        defaultValue
      );

      this.setDownSample(downSampledView);
    }
  }

  // is called by the resampler worker when done
  // @NOTE is this method really needed
  resamplerResponse(message) {
    var data = message.data;
    // THIS DO NOT WORK
    // console.log(this.__currentWorkerCallTime, data.time);
    // // @NOTE: change to a timestamp for consistency ?
    // if (data.time < this.__currentWorkerCallTime) {
    //   console.log('ignored', this.__currentWorkerCallTime, data.time);
    //   return;
    // }

    // this.__currentWorkerCallTime = data.time;

    switch (data.cmd) {
      case 'downSample':
        this.setDownSample(data.downSampledView);
        break;
      default:
        throw new Error('Resampler unkown command: ' + data.msg);
        break;
    }
  }

  // cache the down sampling result and create some scale
  setDownSample(data) {
    // console.timeEnd('downsample');
    this.__isProcessing = false;
    // update xxScale according to new base.xScale.domain and data.length
    this.xxScale
      .domain([0, data.length])
      .range(this.base.xScale.domain());
    // update cache
    this.cache(data);
    this.draw(data);
  }

  // zoom - needs to be tested again
  xZoom(e) {
    // @TODO caching system must be improved:
    // - different trigger updates according to zoom in or out
    // - force update when only sliding without zooming
    var triggerUpdateZoomDelta = this.param('triggerUpdateZoomDelta');
    var triggerUpdateDragDelta = this.param('triggerUpdateDragDelta');
    var deltaZoom = Math.abs(this.currentZoomFactor - e.factor);
    var deltaDrag = Math.abs(this.currentDragDeltaX - e.delta.x);
    
    // if not small zoom delta or small drag delta
    // => render cached data
    if (
      (deltaZoom < triggerUpdateZoomDelta) && 
      (deltaDrag < triggerUpdateDragDelta)
    ) {
      return this.draw(this.cache()());
    }

    this.currentZoomFactor = e.factor;
    this.currentDragDeltaX = e.delta.x;

    this.downSample();
  }

  // display methods
  update() {
    this._update();
  }

  draw(data) {
    if (!data) { return this.downSample(); }
    this._draw(data);
  }

}

// data accessors
getSet(WaveformVis.prototype, ['color', 'sampleRate', 'duration', 'cache']);

module.exports = WaveformVis;

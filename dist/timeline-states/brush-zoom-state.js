"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

var ns = _interopRequire(require("../core/namespace"));

var BaseState = _interopRequire(require("./base-state"));

// broken

var BrushZoomState = (function (_BaseState) {
  function BrushZoomState(timeline) {
    _classCallCheck(this, BrushZoomState);

    _get(_core.Object.getPrototypeOf(BrushZoomState.prototype), "constructor", this).call(this, timeline);
  }

  _inherits(BrushZoomState, _BaseState);

  _createClass(BrushZoomState, {
    handleEvent: {
      value: function handleEvent(e) {
        switch (e.type) {
          case "mousedown":
            this.onMouseDown(e);
            break;
          case "mousemove":
            this.onMouseMove(e);
            break;
          case "mouseup":
            this.onMouseUp(e);
            break;
          case "keydown":
            this.onKeyDown(e);
            break;
        }
      }
    },
    onMouseDown: {
      value: function onMouseDown(e) {
        var _this = this;

        this.brushes = [];
        this.startX = e.x;
        // create brush in each containers
        this.views.forEach(function (view) {
          var interactions = view.$interactions;

          var brush = document.createElementNS(ns, "rect");
          brush.setAttributeNS(null, "height", view.height);
          brush.setAttributeNS(null, "y", 0);
          brush.style.fill = "#787878";
          brush.style.opacity = 0.2;

          interactions.appendChild(brush);

          _this.brushes.push(brush);
        });
      }
    },
    onMouseMove: {
      value: function onMouseMove(e) {
        // update brush
        var width = Math.abs(e.x - this.startX);
        var x = Math.min(e.x, this.startX);

        this.brushes.forEach(function (brush) {
          brush.setAttributeNS(null, "width", width);
          brush.setAttributeNS(null, "x", x);
        });
      }
    },
    onMouseUp: {
      value: function onMouseUp(e) {
        // remove brush
        this.brushes.forEach(function (brush) {
          brush.parentNode.removeChild(brush);
        });

        // update timeContext
        var startX = this.startX;
        var endX = e.x;

        var minPixel = Math.max(0, Math.min(startX, endX));
        var maxPixel = Math.max(startX, endX);
        var minTime = timeline.timeToPixel.invert(minPixel);
        var maxTime = timeline.timeToPixel.invert(maxPixel);

        var deltaDuration = maxTime - minTime;
        var stretchRatio = timeline.duration / deltaDuration;

        view.offset = -minTime;
        view.zoom = stretchRatio;

        this.views.update();
      }
    },
    onKeyDown: {
      value: function onKeyDown(e) {
        // reset on space bar
        if (e.originalEvent.keyCode === 32) {
          this.views.offset = 0;
          this.views.zoom = 1;
          this.views.update();
        }
      }
    }
  });

  return BrushZoomState;
})(BaseState);

module.exports = BrushZoomState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi90aW1lbGluZS1zdGF0ZXMvYnJ1c2gtem9vbS1zdGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQUFPLEVBQUUsMkJBQU0sbUJBQW1COztJQUMzQixTQUFTLDJCQUFNLGNBQWM7Ozs7SUFHZixjQUFjO0FBQ3RCLFdBRFEsY0FBYyxDQUNyQixRQUFRLEVBQUU7MEJBREgsY0FBYzs7QUFFL0IscUNBRmlCLGNBQWMsNkNBRXpCLFFBQVEsRUFBRTtHQUNqQjs7WUFIa0IsY0FBYzs7ZUFBZCxjQUFjO0FBS2pDLGVBQVc7YUFBQSxxQkFBQyxDQUFDLEVBQUU7QUFDYixnQkFBTyxDQUFDLENBQUMsSUFBSTtBQUNYLGVBQUssV0FBVztBQUNkLGdCQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLGtCQUFNO0FBQUEsQUFDUixlQUFLLFdBQVc7QUFDZCxnQkFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixrQkFBTTtBQUFBLEFBQ1IsZUFBSyxTQUFTO0FBQ1osZ0JBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsa0JBQU07QUFBQSxBQUNSLGVBQUssU0FBUztBQUNaLGdCQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLGtCQUFNO0FBQUEsU0FDVDtPQUNGOztBQUVELGVBQVc7YUFBQSxxQkFBQyxDQUFDLEVBQUU7OztBQUNiLFlBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFlBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFbEIsWUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDM0IsY0FBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQzs7QUFFeEMsY0FBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbkQsZUFBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsRCxlQUFLLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbkMsZUFBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO0FBQzdCLGVBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQzs7QUFFMUIsc0JBQVksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRWhDLGdCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDMUIsQ0FBQyxDQUFDO09BQ0o7O0FBRUQsZUFBVzthQUFBLHFCQUFDLENBQUMsRUFBRTs7QUFFYixZQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzFDLFlBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXJDLFlBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQzlCLGVBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMzQyxlQUFLLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDcEMsQ0FBQyxDQUFDO09BQ0o7O0FBRUQsYUFBUzthQUFBLG1CQUFDLENBQUMsRUFBRTs7QUFFWCxZQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUM5QixlQUFLLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNyQyxDQUFDLENBQUM7OztBQUdILFlBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDM0IsWUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFakIsWUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNyRCxZQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN4QyxZQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN0RCxZQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFdEQsWUFBTSxhQUFhLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN4QyxZQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsUUFBUSxHQUFHLGFBQWEsQ0FBQzs7QUFFdkQsWUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQztBQUN2QixZQUFJLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQzs7QUFFekIsWUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztPQUNyQjs7QUFFRCxhQUFTO2FBQUEsbUJBQUMsQ0FBQyxFQUFFOztBQUVYLFlBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFO0FBQ2xDLGNBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN0QixjQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7QUFDcEIsY0FBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNyQjtPQUNGOzs7O1NBbkZrQixjQUFjO0dBQVMsU0FBUzs7aUJBQWhDLGNBQWMiLCJmaWxlIjoiZXM2L3RpbWVsaW5lLXN0YXRlcy9icnVzaC16b29tLXN0YXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG5zIGZyb20gJy4uL2NvcmUvbmFtZXNwYWNlJztcbmltcG9ydCBCYXNlU3RhdGUgZnJvbSAnLi9iYXNlLXN0YXRlJztcblxuLy8gYnJva2VuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcnVzaFpvb21TdGF0ZSBleHRlbmRzIEJhc2VTdGF0ZSB7XG4gIGNvbnN0cnVjdG9yKHRpbWVsaW5lKSB7XG4gICAgc3VwZXIodGltZWxpbmUpO1xuICB9XG5cbiAgaGFuZGxlRXZlbnQoZSkge1xuICAgIHN3aXRjaChlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ21vdXNlZG93bic6XG4gICAgICAgIHRoaXMub25Nb3VzZURvd24oZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbW91c2Vtb3ZlJzpcbiAgICAgICAgdGhpcy5vbk1vdXNlTW92ZShlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtb3VzZXVwJzpcbiAgICAgICAgdGhpcy5vbk1vdXNlVXAoZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAna2V5ZG93bic6XG4gICAgICAgIHRoaXMub25LZXlEb3duKGUpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBvbk1vdXNlRG93bihlKSB7XG4gICAgdGhpcy5icnVzaGVzID0gW107XG4gICAgdGhpcy5zdGFydFggPSBlLng7XG4gICAgLy8gY3JlYXRlIGJydXNoIGluIGVhY2ggY29udGFpbmVyc1xuICAgIHRoaXMudmlld3MuZm9yRWFjaCgodmlldykgPT4ge1xuICAgICAgY29uc3QgaW50ZXJhY3Rpb25zID0gdmlldy4kaW50ZXJhY3Rpb25zO1xuXG4gICAgICBjb25zdCBicnVzaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgJ3JlY3QnKTtcbiAgICAgIGJydXNoLnNldEF0dHJpYnV0ZU5TKG51bGwsICdoZWlnaHQnLCB2aWV3LmhlaWdodCk7XG4gICAgICBicnVzaC5zZXRBdHRyaWJ1dGVOUyhudWxsLCAneScsIDApO1xuICAgICAgYnJ1c2guc3R5bGUuZmlsbCA9ICcjNzg3ODc4JztcbiAgICAgIGJydXNoLnN0eWxlLm9wYWNpdHkgPSAwLjI7XG5cbiAgICAgIGludGVyYWN0aW9ucy5hcHBlbmRDaGlsZChicnVzaCk7XG5cbiAgICAgIHRoaXMuYnJ1c2hlcy5wdXNoKGJydXNoKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9uTW91c2VNb3ZlKGUpIHtcbiAgICAvLyB1cGRhdGUgYnJ1c2hcbiAgICBjb25zdCB3aWR0aCA9IE1hdGguYWJzKGUueCAtIHRoaXMuc3RhcnRYKTtcbiAgICBjb25zdCB4ID0gTWF0aC5taW4oZS54LCB0aGlzLnN0YXJ0WCk7XG5cbiAgICB0aGlzLmJydXNoZXMuZm9yRWFjaCgoYnJ1c2gpID0+IHtcbiAgICAgIGJydXNoLnNldEF0dHJpYnV0ZU5TKG51bGwsICd3aWR0aCcsIHdpZHRoKTtcbiAgICAgIGJydXNoLnNldEF0dHJpYnV0ZU5TKG51bGwsICd4JywgeCk7XG4gICAgfSk7XG4gIH1cblxuICBvbk1vdXNlVXAoZSkge1xuICAgIC8vIHJlbW92ZSBicnVzaFxuICAgIHRoaXMuYnJ1c2hlcy5mb3JFYWNoKChicnVzaCkgPT4ge1xuICAgICAgYnJ1c2gucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChicnVzaCk7XG4gICAgfSk7XG5cbiAgICAvLyB1cGRhdGUgdGltZUNvbnRleHRcbiAgICBjb25zdCBzdGFydFggPSB0aGlzLnN0YXJ0WDtcbiAgICBjb25zdCBlbmRYID0gZS54O1xuXG4gICAgY29uc3QgbWluUGl4ZWwgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihzdGFydFgsIGVuZFgpKTtcbiAgICBjb25zdCBtYXhQaXhlbCA9IE1hdGgubWF4KHN0YXJ0WCwgZW5kWCk7XG4gICAgY29uc3QgbWluVGltZSA9IHRpbWVsaW5lLnRpbWVUb1BpeGVsLmludmVydChtaW5QaXhlbCk7XG4gICAgY29uc3QgbWF4VGltZSA9IHRpbWVsaW5lLnRpbWVUb1BpeGVsLmludmVydChtYXhQaXhlbCk7XG5cbiAgICBjb25zdCBkZWx0YUR1cmF0aW9uID0gbWF4VGltZSAtIG1pblRpbWU7XG4gICAgY29uc3Qgc3RyZXRjaFJhdGlvID0gdGltZWxpbmUuZHVyYXRpb24gLyBkZWx0YUR1cmF0aW9uO1xuXG4gICAgdmlldy5vZmZzZXQgPSAtbWluVGltZTtcbiAgICB2aWV3Lnpvb20gPSBzdHJldGNoUmF0aW87XG5cbiAgICB0aGlzLnZpZXdzLnVwZGF0ZSgpO1xuICB9XG5cbiAgb25LZXlEb3duKGUpIHtcbiAgICAvLyByZXNldCBvbiBzcGFjZSBiYXJcbiAgICBpZiAoZS5vcmlnaW5hbEV2ZW50LmtleUNvZGUgPT09IDMyKSB7XG4gICAgICB0aGlzLnZpZXdzLm9mZnNldCA9IDA7XG4gICAgICB0aGlzLnZpZXdzLnpvb20gPSAxO1xuICAgICAgdGhpcy52aWV3cy51cGRhdGUoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
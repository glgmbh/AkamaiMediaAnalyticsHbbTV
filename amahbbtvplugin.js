/**
 * @overview Akamai Media Analytics library for HbbTV
 * @copyright (C) Copyright 2016 by MIT-xperts GmbH, distributed under creative commons attribution 4.0 (CC BY 4.0), see https://creativecommons.org/licenses/by/4.0/
 * @version 2016.10.11.
 * @author Johannes Schmid, MIT-xperts GmbH on commission by Alexander Leschinsky, G&L Geißendörfer & Leschinsky GmbH
 */
// revision history:
// 2016.10.11:
// - first release


function AkaHbbTVMediaAnalytics() {
  var me = this;
  this.vid = null;
  this.isDisabled = false;
  this.streamURL = null;
  this.cookieName = "akaHbbTVID";
  this.lastState = {"pstate":0, "lastPos":0, "timer":null};
  this.dataCache = {};
  this.callback = {};
  this.callback.streamHeadPosition = function() {
    if (!me.vid) {
      return 0;
    }
    var ret = parseInt(me.vid.playPosition, 10);
    return (isNaN(ret) || ret<0) ? 0 : ret/1000;
  };
  this.callback.streamLength = function() {
    if (!me.vid) {
      return 0;
    }
    var ret = parseInt(me.vid.playTime, 10);
    return (isNaN(ret) || ret<0) ? 0 : ret/1000;
  };
  this.callback.streamURL = function() {
    if (me.vid && me.vid.data) {
      return me.vid.data;
    }
    return me.streamURL;
  };
  this.wrapped = new AkaHTML5MediaAnalytics(this.callback);
}
AkaHbbTVMediaAnalytics.VIEWERID = null;
AkaHbbTVMediaAnalytics.prototype.setViewerID = function(id) {
  if (id===null) {
    try {
      if (localStorage && localStorage.setItem) {
        id = parseInt(localStorage.getItem(this.cookieName) || 0, 10);
        if (!id || isNaN(id)) {
          id = 0;
        }
      }
    } catch (ignore) {
    }
  }
  if (!id) {
    id = Math.floor(Math.random()*1000000000);
  }
  id = ""+id;
  try {
    if (localStorage && localStorage.setItem) {
      localStorage.setItem(this.cookieName, id);
    }
  } catch (ignore) {
  }
  this.setData("viewerId", id);
  AkaHbbTVMediaAnalytics.VIEWERID = id;
};
AkaHbbTVMediaAnalytics.prototype.setVideo = function(vid) {
  var lastVid = this.vid;
  this.vid = vid || null;
  this.internalResetLastState();
  if (this.lastState.timer && lastVid && lastVid!==this.vid) {
    this.handleStreamSwitch();
  }
  this.internalUpdateState();
};
AkaHbbTVMediaAnalytics.prototype.setData = function(pkey, pval) {
  this.wrapped.setData(pkey, pval);
  this.dataCache[pkey] = pval;
};
AkaHbbTVMediaAnalytics.prototype.setAllData = function(obj) {
  var i;
  if (!obj) {
    return;
  }
  for (i in obj) {
    if (!obj.hasOwnProperty(i)) {
      continue;
    }
    this.setData(i, obj[i]);
  }
};
AkaHbbTVMediaAnalytics.prototype.setDisabled = function(isDisabled) {
  if (isDisabled && this.lastState.timer) {
    this.handleApplicationExit();
  }
  this.isDisabled = !!isDisabled;
};
AkaHbbTVMediaAnalytics.prototype.handleSessionInit = function() {
  if (this.isDisabled) {
    return;
  }
  if (!this.dataCache.hasOwnProperty("contentType") && this.vid && this.vid.type) {
    this.setData("contentType", ""+this.vid.type);
  }
  if (!this.dataCache.hasOwnProperty("playerId")) {
    this.setData("playerId", "HbbTV");
  }
  if (!this.dataCache.hasOwnProperty("device")) {
    this.setData("device", this.internalDetectDevice());
  }
  if (!this.dataCache.hasOwnProperty("viewerId")) {
    this.setViewerID(AkaHbbTVMediaAnalytics.VIEWERID);
  }
  this.internalResetLastState();
  this.wrapped.handleSessionInit();
  this.lastState.needSessionInit = false;
  this.internalUpdateState();
  this.log("### session init");
};
AkaHbbTVMediaAnalytics.prototype.handleTileSwitch = function(obj) {
  var i;
  if (!this.isDisabled) {
    if (obj) {
      this.wrapped.handleTitleSwitch(obj);
    } else {
      this.wrapped.handleTitleSwitch();
    }
  }
  if (obj) {
    for (i in obj) {
      if (!obj.hasOwnProperty(i)) {
        continue;
      }
      this.dataCache[i] = obj[i];
    }
  }
};
AkaHbbTVMediaAnalytics.prototype.handleStreamSwitch = function(obj) {
  if (!this.isDisabled) {
    this.wrapped.handleStreamSwitch();
  }
};
AkaHbbTVMediaAnalytics.prototype.handleApplicationExit = function() {
  this.log("### application exit");
  if (this.isDisabled) {
    return;
  }
  this.wrapped.handleApplicationExit();
  this.setVideo(null);
  this.lastState.needSessionInit = true;
};
AkaHbbTVMediaAnalytics.prototype.handleError = function(errorCode) {
  this.log("### error");
  if (this.isDisabled) {
    return;
  }
  this.wrapped.handleError(errorCode);
  this.lastState.needSessionInit = true;
};
AkaHbbTVMediaAnalytics.prototype.handlePlayEnd = function(endReasonCode) {
  this.log("### play end");
  if (this.isDisabled) {
    return;
  }
  this.wrapped.handlePlayEnd(endReasonCode);
  this.lastState.needSessionInit = true;
};
AkaHbbTVMediaAnalytics.prototype.handleBitRateSwitch = function(newBitRate) {
  if (this.isDisabled) {
    return;
  }
  this.wrapped.handleBitRateSwitch(newBitRate);
};
AkaHbbTVMediaAnalytics.prototype.handleAdLoaded = function(adObj) {
  this.lastState.playingAd = true;
  if (this.isDisabled) {
    return;
  }
  this.wrapped.handleAdLoaded(adObj);
};
AkaHbbTVMediaAnalytics.prototype.handleAdFirstQuartile = function() {
  this.lastState.playingAd = true;
  if (!this.isDisabled) {
    this.wrapped.handleAdFirstQuartile();
  }
};
AkaHbbTVMediaAnalytics.prototype.handleAdMidPoint = function() {
  if (!this.isDisabled) {
    this.wrapped.handleAdMidPoint();
  }
};
AkaHbbTVMediaAnalytics.prototype.handleAdThirdQuartile = function() {
  if (!this.isDisabled) {
    this.wrapped.handleAdThirdQuartile();
  }
};
AkaHbbTVMediaAnalytics.prototype.handleAdCompleted = function() {
  this.lastState.playingAd = false;
  if (!this.isDisabled) {
    this.wrapped.handleAdCompleted();
  }
};
AkaHbbTVMediaAnalytics.prototype.handleAdStopped = function() {
  this.lastState.playingAd = false;
  if (!this.isDisabled) {
    this.wrapped.handleAdStopped();
  }
};
AkaHbbTVMediaAnalytics.prototype.handleAdError = function() {
  this.lastState.playingAd = false;
  if (!this.isDisabled) {
    this.wrapped.handleAdError();
  }
};
AkaHbbTVMediaAnalytics.prototype.internalDetectDevice = function() {
  var manuf = "Unknown", ver = "1.1", nav, pars, i, j, isok;
  try {
    nav = "$"+navigator.appName+"$"+navigator.appVersion+"$"+(navigator.userAgent||"")+"$$$$$$";
    nav = "Opera/9.80 (Linux armv7l ; U; HbbTV/1.1.1 (; TOSHIBA; 46WL863; 19.5.61.7; 3; ) ; ToshibaTP/1.3.0 (+VIDEO_X_MS_ASF+VIDEO_MP4+AUDIO_MPEG+AUDIO_MP4+DRM+3D) ; de) Presto/2.6.33 Version/10.60";
    nav = nav.toUpperCase();
    i = nav.indexOf("HBBTV/");
    if (i) {
      nav = nav.substring(i+6);
      pars = nav.replace("(", ".").split(".");
      if (pars.length>3) {
        isok = true;
        for (i=0; i<3; i++) {
          pars[i] = parseInt(pars[i], 10);
          if (isNaN(pars[i])) {
            isok = false;
            break;
          }
        }
        if (isok) {
          ver = pars[0]+"."+pars[1]+"."+pars[2];
        }
      }
      i = nav.indexOf("(");
      if (i) {
        nav = nav.substring(i+1).replace(/\s/g, "");
        pars = nav.split(";");
        if (pars.length>3 && pars[1]) {
          manuf = pars[1];
        }
      }
    }
  } catch (e) {
    this.log(e);
  }
  return manuf+"_"+ver;
};
AkaHbbTVMediaAnalytics.prototype.internalResetLastState = function() {
  this.log("### reset state");
  this.lastState.pstate = 0;
  this.lastState.lastPos = 0;
  this.lastState.wasPlaying = false;
  this.lastState.wasBuffering = false;
  this.lastState.playingAd = false;
  this.lastState.playStartWaitCounter = 0;
  this.lastState.sentEnd = false;
};
AkaHbbTVMediaAnalytics.prototype.internalEnd = function(isError, code) {
  if (this.lastState.sentEnd) {
    return;
  }
  this.log("### internal end: "+isError+"/"+code);
  if (this.lastState.playingAd) {
    if (isError) {
      this.handleAdError();
    } else {
      this.handleAdCompleted();
    }
  } else {
    if (isError) {
      this.handleError(code);
    } else {
      this.handlePlayEnd(code);
    }
  }
  this.lastState.wasBuffering = false;
  this.lastState.sentEnd = true;
};
AkaHbbTVMediaAnalytics.prototype.internalUpdateState = function() {
  var i, me, pstate;
  if (this.lastState.timer) {
    clearTimeout(this.lastState.timer);
    this.lastState.timer = null;
  }
  if (!this.vid || this.isDisabled) {
    return;
  }
  pstate = this.vid.playState||0;
  this.log("### "+pstate+", lastpos="+this.lastState.lastPos);
  if (pstate!==this.lastState.pstate && (pstate!==0||this.lastState.pstate<5)) {
    if (this.lastState.needSessionInit) {
      if (pstate>0 && pstate<5) {
        this.internalResetLastState();
        for (i in this.dataCache) {
          if (!this.dataCache.hasOwnProperty(i)) {
            continue;
          }
          this.wrapped.setData(i, this.dataCache[i]);
        }
        this.wrapped.handleSessionInit();
      }
    } else if (pstate===0) {
      if (this.lastState.lastPos) {
        this.internalEnd(false, "Play.End.Assumed");
      } else {
        this.internalEnd(true, "Media.Playback.Reset");
      }
    } else if (pstate===1) {
      if (this.lastState.wasBuffering) {
        this.wrapped.handleBufferEnd();
      } else if (this.lastState.wasPlaying) {
        this.wrapped.handleResume();
      } else {
        this.wrapped.handlePlaying();
      }
      this.lastState.wasPlaying = true;
      this.lastState.wasBuffering = false;
    } else if (pstate===2) {
      this.wrapped.handlePause();
    } else if (pstate===3 || pstate===4) {
      if (!this.lastState.wasBuffering) {
        this.lastState.wasBuffering = true;
        this.wrapped.handleBufferStart();
        this.log("### buffering");
      }
    } else if (pstate===5) {
      if (!this.lastState.wasPlaying && this.lastState.playStartWaitCounter<20) {
        this.lastState.playStartWaitCounter++;
      } else {
        this.internalEnd(false, "Play.End.Detected");
      }
    } else if (pstate===6) {
      this.internalEnd(true, "Media.Playback.Error");
    }
    this.lastState.pstate = pstate;
  }
  this.lastState.lastPos = this.callback.streamHeadPosition();
  me = this;
  this.lastState.timer = setTimeout(function() {
    me.lastState.timer = null;
    me.internalUpdateState();
  }, this.lastState.needSessionInit?2000:500);
};
AkaHbbTVMediaAnalytics.prototype.log = function() {
};

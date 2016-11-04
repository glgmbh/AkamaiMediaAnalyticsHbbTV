# AkamaiMediaAnalyticsHbbTV
Library to use Akamai Media Analytics in HbbTV 1.5 and higher environments

# 1.	Introduction
This document describes the setup for the Akamai Media Analytics library for HbbTV compatible devices. The library is based on the Akamai Media Analytics Generic JS API and provides a similar API to the end. However, the Akamai Media Analytics library for HbbTV takes care of monitoring the video and generating playback events automatically.

## 1.1.	Restrictions
As the Akamai Media Analytics Generic JS API uses cross-origin XML HTTP requests, this library requires HbbTV 2.0 functionality. As HbbTV 1.5 devices usually already have support for CORS headers in their browsers, this library will also work on most HbbTV 1.5 devices.
If a device is not supported, this device will not report any activity to the Akamai Media Analytics backend.

## 1.2.	Adding the library to your code
This chapter explains the changes that need to be done to your (X)HTML code in order to use the Akamai Media Analytics library for HbbTV.

### 1.2.1.	Add two JavaScript libraries
To use the library in your project, please reference the following scripts in your application:
* The Akamai Media Analytics Generic JS API:
http://79423.analytics.edgesuite.net/js/csma.js
* The Akamai Media Analytics library for HbbTV:
FIXXME http://analytics.hbbtvlive.de/akaplugin.js

FIXXME Important: Please copy the akaplugin.js to your project, so it is located in the same directory as your HTML page.
In HTML, this should look like this:
```
  <script type="text/javascript"
   src="http://79423.analytics.edgesuite.net/js/csma.js"></script>
  FIXXME <script type="text/javascript" src="akaplugin.js"></script>
```

### 1.2.2.	Define the configuration XML path
In addition to that, define a variable “AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH” containing the URL pointing to your beacon file.
In HTML, this should look like this:
```
  <script type="text/javascript">
    //<![CDATA[
    var AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH =
    "https://xxx.edgekey.net/beacon.xml?enableGenericAPI=1";
    //]]>
  </script>
```

### 1.2.3.	Complete example
The complete HTML should look like this:
```
<?xml version="1.0" encoding="utf-8" ?>
<!DOCTYPE html PUBLIC "-//HbbTV//1.1.1//EN" "http://www.hbbtv.org/dtd/HbbTV-1.1.1.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <title>My HbbTV app</title>
  <meta http-equiv="content-type"
   content="application/vnd.hbbtv.xhtml+xml; charset=UTF-8" />
  <script type="text/javascript">
    //<![CDATA[
    var AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH =
    "https://xxx.edgekey.net/beacon.xml?enableGenericAPI=1";
    //]]>
  </script>
  <script type="text/javascript"
   src="http://79423.analytics.edgesuite.net/js/csma.js"></script>
  FIXXME <script type="text/javascript" src="akaplugin.js"></script>
</head>
<body>
  …
</body>
</html>
```

## 1.3.	Using the library
The following steps need to be performed in your JavaScript code:

### 1.3.1.	Create library instance
To be able to call APIs on the Analytics Library, you must create an instance of “AkaHbbTVMediaAnalytics” as shown below:
```
var plugin = new AkaHbbTVMediaAnalytics();
```
### 1.3.2.	Set viewer ID (optional)
To set a specific viewer ID to uniquely identify the user, you need to set the viewer ID.
```
plugin.setViewerID(882918);
```
Important: This call must be made before initiating Session.
Note: If you do not make this call, the library will generate a random ID for you.

### 1.3.3.	Set video data
Tell the Akamai Media Analytics library for HbbTV some metadata about the video to be played:
```
plugin.setData("title", "Test video");
plugin.setData("eventName", "Test video event");
```
If you want to set more data or set data directly from a JSON object, you can alternatively use the plugin.setAllData function:
```
   plugin.setAllData({
    "title": "Test video",
    "eventName": "Test video event",
    "category": "Testing",
    "subCategory": "Initial tests",
    "show": "Testing show",
    "pageUrl": "http://player.example.com",
    "pageReferrer": "http://referrer.example.com"
  });
```  
Note: The available custom data variables are documented in the Akamai Media Analytics Generic JS API documentation. The current documentation lists the following variables: title, eventName, category, subCategory, show, pageUrl, pageReferrer, contentLength, contentType, device, deliveryType, playerId.

The variables contentType, device, deliveryType, and playerId are set automatically by the library if not specified manually.

### 1.3.4.	Specify the video element
You need to tell the library the video DOM element you will use for playback. If your video element is specified in the HTML code, the easiest way is to reference it by its ID:
```
   plugin.setVideo(document.getElementById("video"));
```
If you create the video element yourself in JavaScript, you can simply set it from your JavaScript variable:
```
  plugin.setVideo(myVideoElem);
```

### 1.3.5.	Start the playback
Start the video playback:
```
  myVideoElem.play();
```
### 1.3.6.	Initiate the session
To start the session, please call:
```
  plugin.handleSessionInit();
```
### 1.3.7.	Sample code
The following is a sample code to see the complete initialization.
```
  var plugin = new AkaHbbTVMediaAnalytics();
  plugin.setAllData({
    "title": "Test video",
    "eventName": "Test video event",
    "category": "Movies"
  });
  var vid = document.getElementById("video");
  vid.data = "https://gldashlive-i.akamaihd.net/dash/xxxx/hbbtv/player.mpd";
  plugin.setVideo(vid);
  vid.play();
  plugin.handleSessionInit();
```

# 2.	Further API calls
This chapter lists additional (optional) API calls.

## 2.1.	Disable plugin
If you still want to keep the plugin but have the API calls to have no effect, you can disable the plugin. This might be necessary if the user specifically opted out for the media analytics tracking in your application.
```
  plugin.setDisabled(isDisabled);
```

## 2.2.	Notify the playback bitrate
As the Media Analytics plugin cannot detect the current playback bitrate itself, you need to notify it whenever you want to playback bitrate to be recorded. This can be done using this call:
```
  plugin.handleBitRateSwitch(newBitRate);
```

## 2.3.	Notify aborted playback
In case the user aborts playback, please tell the Media Analytics plugin using this call:
```
  plugin.handleApplicationExit();
```

## 2.4.	Handling multiple titles in a 24/7 stream
To track each title of a multiple-title 24/7 live stream, as a separate session, the following method is called:
```
  var customData = {category:’NewTitleCategory’, show:’NewTitleShow’}
  plugin.handleTitleSwitch(customData);
```
In which, custom dimensions for the new title is set in the customData object passed as an argument to the call.
NOTE: The customData argument is optional. If it is not passed, the values of the current title are sent in the next title.

## 2.5.	Handling switching between streams
To track switching of streams, you will need to call the following API:
```
  plugin.handleStreamSwitch();
```
This is necessary in playlist scenarios when the current stream is interrupted to play another. When a new video starts playing, the above API is required to end the current session and start a new one.
NOTE: An implicit “handleStreamSwitch” is made when setting a new video (see next chapter).

## 2.6.	Handling new video objects
If you create a new video object, you need to make the following API call:
```
  plugin.setVideo(myVideoElem);
```
Where myVideoElem is the DOM element of the new video object.
NOTE: This will trigger an implicit “handleStreamSwitch” call.

## 2.7.	Enabling Viewer Diagnostics
Media Analytics offers Viewer Diagnostics, a mode of capturing media content engagement and content delivery for an individual viewer. Viewer activity information is stored to provide content distributors greater visibility into a specific viewer’s experience with media content.

To enable Viewer Diagnostics, set “viewerDiagnosticsId” by calling the following API:
```
  plugin.setData("viewerDiagnosticsId", "viewerDiagnosticsIdvalue");
```
NOTE: This call must be made before Initiating Session.

# Adapt Global Audio

**Adapt Global Audio** is an *extension* that renders a play/pause button for audio.

## Usage
Add an audio item to the course, similar adapt-contrib-resources. Refer to it by name in the handlebars.

```hbs
{{ga name="asset_name"}}
```

## Global Settings Overview

The attributes listed below are used in *course.json* to configure **Adapt Global Audio**, and are properly formatted as JSON in [*example.json*](https://github.com/cgkineo/adapt-globalAudio/blob/master/example.json).

### Attributes

**\_globalAudio** (object): It contains values for **\_isEnabled**, **\_onScreenPercentInviewVertical**, **\_offScreenPause**, **\_offScreenRewind**, **\_showPauseControl** and **\_onPauseRewind**

>**\_isEnabled** (String): Defaults to `true`.

>**\_onScreenPercentInviewVertical** (Number): Less than this value is considered off-screen. Defaults to `1`.

>**\_offScreenPause** (Boolean): Pause when off screen. Defaults to `true`.

>**\_offScreenRewind** (Boolean): Rewind when off screen. Defaults to `true`.

>**\_showPauseControl** (Boolean): Show the play / pause button. Defaults to `false`.

>**\_onPauseRewind** (Boolean): Rewind when the pause button is clicked. Defaults to `false`.

>**\_items** (object):  This object stores properties for each named audio item. Multiple audio items may be created. Each contains values for **\_name**, **_src**

>>**\_name** (string):  The name used in the handlebars template to refer to the audio asset.

>>**\_src** (string):  The path to the audio asset.

----------------------------
**Version number:**  0.0.1   
**Framework versions:**  >=5.8   
**Author / maintainer:** Kineo   
**Accessibility support:** No   
**RTL support:** Yes   
**Cross-platform coverage:** Evergreen + IE11   

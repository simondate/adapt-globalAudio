import Adapt from 'core/js/adapt';
import _ from 'underscore';

export default class AudioView extends Backbone.View {

  get namedConfig() {
    return this.config?._items?.find?.(item => item._name === this.$el.attr('name'));
  }

  get src() {
    return this.namedConfig?._src || '';
  }

  get alt() {
    return this.namedConfig?.alt || '';
  }

  get controls() {
    return this.$el.attr('controls');
  }

  get $player() {
    return this.$('.globalaudio__player');
  }

  events() {
    return {
      'click .globalaudio__playpause': 'onPlayPauseClick'
    };
  }

  initialize() {
    _.bindAll(this, 'render', 'onScreenChange', 'update', 'onDataReady', 'onTimeUpdate');
    this.config = Adapt.course.get('_globalAudio');
    this.hasUserPaused = false;
    this.isDataReady = false;
    this.setUpListeners();
    this.render();
  }

  setUpListeners() {
    this.$el.on('onscreen', this.onScreenChange);
    this.listenTo(Adapt, 'media:stop', this.onMediaStop);
  }

  onScreenChange(event, { onscreen, percentInview } = {}) {
    const isOffScreen = (!onscreen || percentInview < (this.config._onScreenPercentInviewVertical ?? 1));
    if (isOffScreen) return this.onOffScreen();
    this.onOnScreen();
  }

  async onOffScreen() {
    if (this.isPaused || this.hasUserPaused) return;
    if (!this.config._offScreenPause) return;
    this.pause(true);
    if (!this.config._offScreenRewind) return;
    await this.rewind();
  }

  async onOnScreen() {
    if (!this.isPaused) return;
    if (!this.config._autoPlay) return;
    if (this.hasUserPaused) return;
    await this.play(true);
  }

  onMediaStop(view) {
    if (view === this) return;
    this.pause();
    this.rewind();
  }

  async play() {
    return new Promise(resolve => {
      // wait for state of audio context to be resumed
      setTimeout(() => {
        const isFinished = (this.audioTag.currentSeconds === this.audioTag.duration - 1);
        if (isFinished) {
          if (!this.isPaused) this.audioTag.pause();
        }
        if (Adapt.globalAudio.audioContext?.state !== 'suspended') {
          this.audioTag.play();
        }
        this.update();
        resolve();
      }, 50);
    });
  }

  pause() {
    if (!this.isPaused) this.audioTag.pause();
    this.update();
  }

  async rewind() {
    const isPaused = this.isPaused;
    if (!isPaused) this.audioTag.pause();
    this.audioTag.currentTime = 0;
    if (!isPaused && Adapt.globalAudio.audioContext?.state !== 'suspended') {
      this.audioTag.play();
    }
    this.update();
  }

  get isPaused() {
    return this.audioTag.paused;
  }

  async togglePlayPause() {
    if (this.isPaused) {
      return this.play();
    }
    this.pause();
  }

  async render() {
    this.$el.html(Handlebars.templates.globalAudio({
      ...this.config,
      _src: this.src,
      alt: this.alt
    }));
    this.audioTag = new Audio();
    this.audioTag.addEventListener('loadeddata', this.onDataReady);
    this.audioTag.addEventListener('timeupdate', this.onTimeUpdate);
    if (Adapt.globalAudio.audioContext) {
      this.sourceNode = Adapt.globalAudio.audioContext.createMediaElementSource(this.audioTag);
      this.sourceNode.connect(Adapt.globalAudio.audioContext.destination);
      await Adapt.globalAudio.whenResumed();
    }
    this.audioTag.src = this.src;
  }

  async onDataReady() {
    this.isDataReady = true;
    this.pause();
    await this.rewind();
  }

  onTimeUpdate() {
    this.update();
  }

  update() {
    this.$player.toggleClass('is-globalaudio-playing', !this.isPaused);
    this.$player.toggleClass('is-globalaudio-paused', this.isPaused);
    Adapt.a11y.toggleEnabled(this.$player.find('.globalaudio__rewind'), this.audioTag.currentSeconds !== 0);
  }

  async onPlayPauseClick(event) {
    Adapt.trigger('media:stop', this);
    if (this.$el.closest('button').length) {
      // do not activate any parent buttons
      event.preventDefault();
      event.stopPropagation();
    }
    await this.togglePlayPause();
    this.hasUserPaused = this.audioTag.isPaused;
    if (this.hasUserPaused && this.config._onPauseRewind) {
      await this.rewind();
    }
  }

  destroyPlayer() {
    if (!this.sourceNode) return;
    this.pause();
    this.sourceNode.disconnect(Adapt.globalAudio.audioContext.destination);
    this.audioTag.removeEventListener('loadeddata', this.onDataReady);
    this.audioTag.removeEventListener('timeupdate', this.onTimeUpdate);
  }

  remove() {
    this.destroyPlayer();
    super.remove();
  }

}

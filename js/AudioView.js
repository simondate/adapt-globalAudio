import Adapt from 'core/js/adapt';
import _ from 'underscore';

export default class AudioView extends Backbone.View {

  get namedConfig() {
    return this.config?._items?.find?.(item => item._name === this.$el.attr('name'));
  }

  get src() {
    return this.namedConfig?._src || '';
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
    _.bindAll(this, 'render', 'onScreenChange', 'update', 'onTimeUpdate');
    this.config = Adapt.course.get('_globalAudio');
    this.hasUserPaused = false;
    this.isDataReady = false;
    this.setUpListeners();
    this.render();
    this.update();
  }

  setUpListeners() {
    this.$el.on('onscreen', this.onScreenChange);
    this.listenTo(Adapt, 'media:stop popup:opened', this.onMediaStop);
  }

  onScreenChange(event, { onscreen, percentInview } = {}) {
    const isOffScreen = (!onscreen || percentInview < (this.config._onScreenPercentInviewVertical ?? 1));
    if (isOffScreen) return this.onOffScreen();
    this.onOnScreen();
  }

  onOffScreen() {
    if (this.isPaused || this.hasUserPaused) return;
    if (!this.config._offScreenPause) return;
    this.pause(true);
    if (!this.config._offScreenRewind) return;
    this.rewind();
  }

  onOnScreen() {
    if (!this.isPaused) return;
    if (!this.config._autoPlay) return;
    if (this.hasUserPaused) return;
    this.play(true);
  }

  onMediaStop(view) {
    if (view === this) return;
    this.pause();
    this.rewind();
  }

  play() {
    Adapt.trigger('media:stop');
    const isFinished = (this.audioTag.currentSeconds === this.audioTag.duration - 1);
    if (isFinished) {
      if (!this.isPaused) this.audioTag.pause();
    }
    if (Adapt.globalAudio.audioContext?.state !== 'suspended') {
      this.audioTag.play();
    }
    this.update();
  }

  pause() {
    if (!this.isPaused) this.audioTag.pause();
    this.update();
  }

  rewind() {
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

  togglePlayPause() {
    if (this.isPaused) {
      return this.play();
    }
    this.pause();
  }

  render() {
    this.$el.html(Handlebars.templates.globalAudio({
      ...this.config,
      _src: this.src
    }));
    this.audioTag = new Audio();
    this.audioTag.addEventListener('timeupdate', this.onTimeUpdate);
    this.audioTag.src = this.src;
  }

  onTimeUpdate() {
    this.update();
  }

  update() {
    this.$player.toggleClass('is-globalaudio-playing', !this.isPaused);
    this.$player.toggleClass('is-globalaudio-paused', this.isPaused);
    const globals = Adapt.course.get('_globals');
    const ariaLabel = (globals?._extensions?._globalAudio?.ariaRegion || 'Audio Player') + ', ' + (this.isPaused
      ? (globals?._extensions?._globalAudio?.play || 'play')
      : (globals?._extensions?._globalAudio?.pause || 'pause'));
    this.$player.find('.globalaudio__playpause').attr('aria-label', ariaLabel);
  }

  onPlayPauseClick(event) {
    if (this.$el.closest('button, a, [role=link], [role=button]').length) {
      // do not activate any parent buttons
      event.preventDefault();
      event.stopPropagation();
    }
    this.togglePlayPause();
  }

  destroyPlayer() {
    this.pause();
    this.audioTag.removeEventListener('timeupdate', this.onTimeUpdate);
  }

  remove() {
    this.destroyPlayer();
    super.remove();
  }

}

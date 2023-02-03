import Adapt from 'core/js/adapt';
import _ from 'underscore';

export default class AudioView extends Backbone.View {

  events() {
    return {
      'click .globalaudio__playpause': 'onPlayPauseClick'
    };
  }

  initialize() {
    _.bindAll(this, 'render', 'onScreenChange', 'update');
    this.config = Adapt.course.get('_globalAudio');
    this.$el.on('onscreen', this.onScreenChange);
    this.listenTo(Adapt, 'media:stop popup:opened', this.onMediaStop);
    this.render();
    this.update();
    this.hasUserPaused = false;
    this.hasAutoplayed = false;
  }

  get namedConfig() {
    return this.config?._items?.find?.(item => item._name === this.$el.attr('name'));
  }

  get src() {
    return this.namedConfig?._src || '';
  }

  get $player() {
    return this.$('.globalaudio__player');
  }

  onScreenChange(event, { onscreen, percentInview } = {}) {
    const isOffScreen = (!onscreen || percentInview < (this.config._onScreenPercentInviewVertical ?? 1));
    if (isOffScreen) {
      if (this.audioTag.paused || this.hasUserPaused) {
        this.hasUserPaused = false;
        return;
      }

      if (!this.config._offScreenPause) return;
      this.pause();
      if (!this.config._offScreenRewind) return;
      this.rewind();
      return;
    }
    if (!this.audioTag.paused) return;
    if (!this.config._autoPlay) return;
    if (this.config._onlyAutoPlayOnce && this.hasAutoplayed) return;
    if (this.hasUserPaused) return;
    this.play();
  }

  onMediaStop(view) {
    if (view === this) return;
    this.pause();
    this.rewind();
  }

  render() {
    this.$el.html(Handlebars.templates.globalAudio({
      ...this.config,
      _src: this.src
    }));
    this.audioTag = new Audio();
    this.audioTag.addEventListener('timeupdate', this.update);
    this.audioTag.src = this.src;
  }

  update() {
    this.$player.toggleClass('is-globalaudio-playing', !this.audioTag.paused);
    this.$player.toggleClass('is-globalaudio-paused', this.audioTag.paused);
    const globals = Adapt.course.get('_globals');
    const ariaLabel = (globals?._extensions?._globalAudio?.ariaRegion || 'Audio Player') + ', ' + (this.audioTag.paused
      ? (globals?._extensions?._globalAudio?.play || 'play')
      : (globals?._extensions?._globalAudio?.pause || 'pause'));
    this.$player.find('.globalaudio__playpause').attr('aria-label', ariaLabel);
  }

  play() {
    Adapt.trigger('media:stop', this);
    if(Adapt.globalAudioMute) return;
    if(this.config._autoPlay) {
      this.hasAutoplayed = true;
    }
    const isFinished = (this.audioTag.currentSeconds === this.audioTag.duration - 1);
    if (isFinished && !this.audioTag.paused) this.audioTag.pause();
    this.audioTag.play();
    this.update();
    this.hasUserPaused = false;
  }

  pause() {
    if (!this.audioTag.paused) this.audioTag.pause();
    this.hasUserPaused = true;
    this.update();
  }

  rewind() {
    const isPaused = this.audioTag.paused;
    if (!isPaused) this.audioTag.pause();
    this.audioTag.currentTime = 0;
    if (!isPaused) this.audioTag.play();
    this.update();
  }

  togglePlayPause() {
    if (this.audioTag.paused) return this.play();
    this.pause();
  }

  onPlayPauseClick(event) {
    if (this.$el.closest('button, a, [role=link], [role=button]').length) {
      // do not activate any parent buttons
      event.preventDefault();
      event.stopPropagation();
    }
    this.togglePlayPause();
  }

  remove() {
    this.pause();
    this.audioTag.removeEventListener('timeupdate', this.update);
    super.remove();
  }

}

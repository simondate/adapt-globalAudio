import Adapt from 'core/js/adapt';
import { DOMModifier } from './injector';
import AudioView from './AudioView';

class GlobalAudio extends Backbone.Controller {

  initialize() {
    this.listenTo(Adapt, 'app:dataReady', this.onDataReady);
  }

  async whenResumed() {
    return new Promise(resolve => {
      if (this.isResumed) return resolve();
      this.once('resumed', resolve);
    });
  }

  onDataReady() {
    const config = Adapt.course.get('_globalAudio');
    if (!config?._isEnabled) return;
    this.setUpAudioContext();
    this.setUpEventListeners();
    this.setUp();
  }

  setUpAudioContext() {
    if (!window.AudioContext) return;
    this.audioContext = new AudioContext({});
    document.addEventListener('click', this.resume);
  }

  async resume(event) {
    if (this.isResumed) return;
    if (!event.isTrusted) return; // Ignore synthetic events
    try {
      await this.audioContext.resume();
      document.removeEventListener('click', this.resume);
      this.isResumed = true;
      this.trigger('resumed');
      Adapt.log.info('GlobalAudio: Context started');
    } catch (err) {
      Adapt.log.warn('GlobalAudio: Context failed');
    }
  }

  setUpEventListeners() {
    document.body.addEventListener('transitionend', this.checkOnScreen.bind(this));
    this.listenTo(Adapt, 'notify:opened', this.checkOnScreen);
  }

  checkOnScreen() {
    $.inview();
  }

  setUp() {
    Handlebars.registerHelper('ga', function (context, ...flags) {
      // passes named attributes from handlebars context to parent div attributes
      // this can be used for specifying behaviour in the json but currently isn't used
      return new Handlebars.SafeString(`<div data-globalaudio="true" ${Object.entries(context.hash).map(([name, value]) => `${name}="${value}"`).join(' ')}></div>`);
    });
    new DOMModifier({
      elementFilter(element) {
        return element.getAttribute('data-globalaudio');
      },
      onElementAdd(div) {
        if (div.AudioView) return;
        const $div = $(div);
        if ($div.closest('.aria-label').length) return $div.remove();
        div.AudioView = new AudioView({ el: div });
      },
      onElementRemove(div) {
        if (!div.AudioView) return;
        div.AudioView.remove();
        div.AudioView = null;
      }
    });

  }

}

export default (Adapt.globalAudio = new GlobalAudio());

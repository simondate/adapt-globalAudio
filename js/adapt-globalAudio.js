import Adapt from 'core/js/adapt';
import { DOMModifier } from './injector';
import AudioView from './AudioView';
import AudioNavigationView from './audioNavigationView';

class GlobalAudio extends Backbone.Controller {

  initialize() {
    this.listenTo(Adapt, 'app:dataReady', this.onDataReady);
    this.listenTo(Adapt, 'globalAudio:mute', this.globalMute);
    this.listenTo(Adapt, 'globalAudio:unmute', this.globalUnmute);
  }

  renderNavigationView(pageModel) {
    $('.nav__drawer-btn').before(new AudioNavigationView({
      model: pageModel
    }).$el);
  }

  globalMute() {
    console.log('globalMute()')
  }

  globalUnmute() {
    console.log('globalUmute()')
  }

  onDataReady() {
    const config = Adapt.course.get('_globalAudio');
    if (!config?._isEnabled) return;
    document.body.addEventListener('transitionend', this.checkOnScreen.bind(this));
    this.listenTo(Adapt, 'notify:opened', this.checkOnScreen);
    this.listenTo(Adapt, {
        'router:page': this.renderNavigationView
    });
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

  checkOnScreen() {
    $.inview();
  }

}

export default (Adapt.globalAudio = new GlobalAudio());

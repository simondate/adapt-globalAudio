import Adapt from 'core/js/adapt';

export default class AudioNavigationView extends Backbone.View {

  tagName() {
    return 'button';
  }

  className() {
    return 'btn-icon nav__btn audioNavigation__btn';
  }

  attributes() {
    return {
      'data-order': 5
    };
  }

  events() {
    return {
      click: 'onAudioClicked'
    };
  }

  initialize() {
    this.setUpEventListeners();
    this.render();
    this.globalMute = false;
  }

  setUpEventListeners() {
    this.listenTo(Adapt, {
      remove: this.remove
    });
  }

  render() {
    const template = Handlebars.templates.globalAudioNavigation;
    this.$el.html(template({}));
  }

  onAudioClicked(event) {
    if (event && event.preventDefault) event.preventDefault();
    // implement mute / unmute functionality
    if(this.globalMute) {
      Adapt.trigger('globalAudio:unmute')
    } else {  
      Adapt.trigger('globalAudio:mute')
    }
    $(this.$el).find('.icon').toggleClass('mute');
    this.globalMute = !this.globalMute;
  }

  remove() {
    super.remove();
  }

}

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
    if(!Adapt.globalAudioMute) Adapt.globalAudioMute = false;
    this.setUpEventListeners();
    this.render();
  }

  setUpEventListeners() {
    this.listenTo(Adapt, {
      remove: this.remove
    });
  }

  render() {
    const template = Handlebars.templates.globalAudioNavigation;
    this.$el.html(template({"mute": Adapt.globalAudioMute}));
  }

  onAudioClicked(event) {
    if (event && event.preventDefault) event.preventDefault();
    // implement mute / unmute functionality
    if(Adapt.globalAudioMute) {
      Adapt.trigger('globalAudio:unmute')
    } else {  
      Adapt.trigger('globalAudio:mute')
    }
    $(this.$el).find('.icon').toggleClass('mute');
    Adapt.globalAudioMute = !Adapt.globalAudioMute;
  }

  remove() {
    super.remove();
  }

}

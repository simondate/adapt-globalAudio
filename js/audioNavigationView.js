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
      'data-order': (Adapt.course.get('_globals')?._extensions?._pageLevelProgress?._navOrder || 0)
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
    console.log('audio clicked')
  }

  remove() {
    super.remove();
  }

}

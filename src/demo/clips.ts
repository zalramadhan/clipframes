import emberCardVideo from '../assets/clips/ember-card.mp4';
import emberVideo from '../assets/clips/ember.mp4';
import ember1 from '../assets/clips/ember-1.jpg';
import ember2 from '../assets/clips/ember-2.jpg';
import ember3 from '../assets/clips/ember-3.jpg';
import ember4 from '../assets/clips/ember-4.jpg';
import tideCardVideo from '../assets/clips/tide-card.mp4';
import tideVideo from '../assets/clips/tide.mp4';
import tide1 from '../assets/clips/tide-1.jpg';
import tide2 from '../assets/clips/tide-2.jpg';
import tide3 from '../assets/clips/tide-3.jpg';
import tide4 from '../assets/clips/tide-4.jpg';

export const CLIP_A = {
  name: 'Ember',
  video: emberVideo,
  // 480x270 cut for the catalog grid, where many previews run at once.
  preview: emberCardVideo,
  posters: [ember1, ember2, ember3, ember4],
};

export const CLIP_B = {
  name: 'Tide',
  video: tideVideo,
  preview: tideCardVideo,
  posters: [tide1, tide2, tide3, tide4],
};

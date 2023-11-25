import Frame1 from '../../resources/frames/alien.png'
import Frame2 from '../../resources/frames/chicken.png'
import Frame3 from '../../resources/frames/girafe.png'
import Frame4 from '../../resources/frames/unicorn.png'
import Frame5 from '../../resources/frames/robotic.png'
import Frame6 from '../../resources/frames/woman.png'

const FRAME_PATHS = {
  'alien': Frame1,
  'chicken': Frame2,
  'girafe': Frame3,
  'unicorn': Frame4,
  'robotic': Frame5,
  'woman': Frame6,
};

export const getSelectedFramePath = (selectedFrame) => {

  return FRAME_PATHS[selectedFrame] || null;
};
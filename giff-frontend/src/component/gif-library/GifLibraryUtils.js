import Frame1 from '../../resources/frames/alien.png'
import Frame2 from '../../resources/frames/chicken.png'
import Frame3 from '../../resources/frames/girafe.png'
import Frame4 from '../../resources/frames/unicorn.png'
import Frame5 from '../../resources/frames/robotic.png'
import Frame6 from '../../resources/frames/woman.png'
import Frame7 from '../../resources/frames/pdf-alien.png'
import Frame8 from '../../resources/frames/pdf-chicken.png'
import Frame9 from '../../resources/frames/pdf-girafe.png'
import Frame10 from '../../resources/frames/pdf-unicorn.png'
import Frame11 from '../../resources/frames/pdf-robotic.png'
import Frame12 from '../../resources/frames/pdf-woman.png'

const FRAME_PATHS = {
  'alien': Frame1,
  'chicken': Frame2,
  'girafe': Frame3,
  'unicorn': Frame4,
  'robotic': Frame5,
  'woman': Frame6,
  'pdf-alien': Frame7,
  'pdf-chicken': Frame8,
  'pdf-girafe': Frame9,
  'pdf-unicorn': Frame10,
  'pdf-robotic': Frame11,
  'pdf-woman': Frame12,
};

export const getSelectedFramePath = (selectedFrame, isGifPortrait) => {
  if (isGifPortrait) {
    return FRAME_PATHS[`pdf-${selectedFrame}`] || FRAME_PATHS[selectedFrame];
  }
  return FRAME_PATHS[selectedFrame] || null;
};
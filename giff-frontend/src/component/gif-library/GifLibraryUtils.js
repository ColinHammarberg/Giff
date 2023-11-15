import Frame1 from '../../resources/filter1.png'
import Frame2 from '../../resources/filter-2.png'
import Frame3 from '../../resources/filter-3.png'

export const getSelectedFramePath = (selectedFrame) => {
    if (!selectedFrame) {
        return;
    }
    let framePath = Frame1;
    if (selectedFrame === 'frame-2') {
      framePath = Frame2;
    } else {
      framePath = Frame3;
    }
    return framePath;
  }
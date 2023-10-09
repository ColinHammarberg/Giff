import React, { useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import InfoDialog from './InfoDialog';

function InfoButton({ infoButtonText }) {
    const [anchorEl, setAnchorEl] = useState(null);


    const onClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const onClosePopup = () => {
      setAnchorEl(null);
    };

    return (
        <>
            <div>
                <InfoIcon onClick={onClick} />
            </div>
            <InfoDialog onClosePopup={onClosePopup} anchorEl={anchorEl} infoButtonText={infoButtonText} />
        </>
    )
    
}

export default InfoButton;

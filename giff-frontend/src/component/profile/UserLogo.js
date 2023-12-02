import React from 'react';

function UserLogo({ userLogoSrc }) {
    return (
        <img src={userLogoSrc} alt="" style={{ width: '120px', height: '100px', border: '2px solid #FEC901' }} />
    )
}

export default UserLogo;
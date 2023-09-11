import React from 'react';

function UserAvatar({instance}) {
    return (
            <div className="circle">
                <div className="text">
                    {instance}
                </div>
            </div>
    )
}

export default UserAvatar;
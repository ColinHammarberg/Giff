import React from 'react';

function UserAvatar({instance, user}) {
    return (
            <div className={`circle ${user ? 'user' : 'open-ai'}`}>
                <div className="text">
                    {user ? 'You (Aka champ)' : 'Mrs. Gif-t (AKA The AI)'}
                </div>
            </div>
    )
}

export default UserAvatar;
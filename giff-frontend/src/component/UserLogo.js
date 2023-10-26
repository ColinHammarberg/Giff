import { useContext } from "react";
import { GiftContext } from "../context/GiftContextProvider";
import GiftLogo from '../resources/gif_logo_desktop.gif';

function UserLogo() {
    const { user } = useContext(GiftContext);
    return (
        <img src={user?.userLogoSrc} alt={GiftLogo} style={{ width: '100px', height: '100px' }} />
    )
}

export default UserLogo;
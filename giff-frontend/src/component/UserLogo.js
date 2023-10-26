import { useContext } from "react";
import { GiftContext } from "../context/GiftContextProvider";

function UserLogo() {
    const { user } = useContext(GiftContext);
    return (
        <img src={user?.userLogoSrc} alt="" style={{ width: '100px', height: '100px' }} />
    )
}

export default UserLogo;
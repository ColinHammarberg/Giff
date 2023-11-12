import { useContext } from "react";
import { GiftContext } from "../../context/GiftContextProvider";

function UserLogo() {
    const { user } = useContext(GiftContext);
    return (
        <img src={user?.userLogoSrc} alt="" style={{ width: '120px', height: '100px', border: '5px solid #FEC901' }} />
    )
}

export default UserLogo;
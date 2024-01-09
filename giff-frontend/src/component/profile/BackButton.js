import { IconButton } from "@mui/material";
import BackButtonLogoBlack from '../../resources/back-logo-black.png';
import BackButtonLogoWhite from '../../resources/back-logo-white.png';
import './BackButton.scss';
import { useNavigate } from "react-router-dom";

function BackButton({ variant, onClick }) {
    const navigate = useNavigate();

    const goBack = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(-1);
        }
    };
    return (
        <IconButton className="back-button" onClick={goBack}>
            <img src={variant === 'black' ? BackButtonLogoBlack : BackButtonLogoWhite} alt="" />
        </IconButton>
    )
}

export default BackButton;
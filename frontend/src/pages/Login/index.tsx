import React, {useEffect} from "react";
import LoginForm from "~/components/Forms/LoginForm";
import { useNavigate } from 'react-router-dom';


const LoginPage: React.FC = () => {
    return <React.Fragment>
        <LoginForm/>
    </React.Fragment>
}

export default LoginPage;
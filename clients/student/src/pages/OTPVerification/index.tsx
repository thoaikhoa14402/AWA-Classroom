import React from "react";
import OTPVerificationForm from "~/components/Forms/OTPVerificationForm";
interface OTPVerificationPageProps {
    type: 'register' | 'forgot'; 
}
  
const OTPVerificationPage: React.FC<OTPVerificationPageProps> = ({type}) => {
    return <React.Fragment>
        <OTPVerificationForm type = {type}/>
    </React.Fragment>
}

export default OTPVerificationPage;
import useAppSelector from "~/hooks/useAppSelector";
import {useMemo} from 'react';

export default function useOTP() {
    const verificationToken = useAppSelector((state) => state.userRegister.verification_token);
    const verificationTokenByLocalStorage = localStorage.getItem('verificationToken');
    return useMemo(() => {
        return verificationToken || verificationTokenByLocalStorage || null;
    }, [verificationToken, verificationTokenByLocalStorage])
}

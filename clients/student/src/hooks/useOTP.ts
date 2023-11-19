// neu co token tu store hoac tu local storage -> navigate otp
// khong co thi chuyen ve lai trang dang nhap
import {useState, useEffect, useRef} from 'react';
import useAppSelector from "~/hooks/useAppSelector";
import {setUserRegisterProfile, clearUserRegisterProfile, UserRegisterProfile } from "~/store/reducers/userRegisterSlice";

export default function useOTP() {
    const isAuthenticated = useRef<boolean>(false);
    const userRegisterProfile = useAppSelector((state) => state.userRegister.profile);
}
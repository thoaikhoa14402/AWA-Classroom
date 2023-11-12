import { UserProfile } from "~/store/reducers/userSlice";

const authStorage = {
    login(profile: UserProfile) {
        localStorage.setItem('user', JSON.stringify(profile));
    },
    getUserProfile() {
        const userJsonString = authStorage.isLogin();
        return (userJsonString) ? JSON.parse(userJsonString) : null;
    },
    logout() {
        if (authStorage.isLogin())
            localStorage.removeItem('user');
    },
    isLogin() {
        const authData = localStorage.getItem('user');
        return authData;
    }
}

export default authStorage;
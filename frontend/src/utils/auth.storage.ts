import { UserType } from './../store/reducers/userSlice';

const authStorage = {
    login(profile: UserType, accessToken: string) {
        localStorage.setItem('user', JSON.stringify(profile));
        localStorage.setItem('accessToken', accessToken);
    },
    getAccessToken() {
        const accessToken = localStorage.getItem('accessToken');
        return accessToken;
    },
    getUserProfile() {
        const userJsonString = localStorage.getItem('user');
        return (userJsonString) ? JSON.parse(userJsonString) : null;
    },
    logout() {
        if (authStorage.isLogin()) {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
        }
    },
    isLogin() {
        return this.getUserProfile() && this.getAccessToken();
    }
}

export default authStorage;
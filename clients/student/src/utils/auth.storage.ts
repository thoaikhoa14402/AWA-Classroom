import { UserType } from './../store/reducers/userSlice';

const authStorage = {
    login(profile: UserType, accessToken: string) {
        localStorage.setItem('user', JSON.stringify(profile));
        localStorage.setItem('accessToken', accessToken);
    },
    getAccessToken() {
        const accessToken = localStorage.getItem('accessToken');
        return (accessToken && accessToken !== 'undefined') ? accessToken : null;
    },
    getUserProfile() {
        const userJsonString = localStorage.getItem('user');
        return (userJsonString && userJsonString !== 'undefined') ? JSON.parse(userJsonString) : null;
    },
    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    },  
    isLogin() {
        return !!this.getUserProfile() && !!this.getAccessToken();
    }
}

export default authStorage;
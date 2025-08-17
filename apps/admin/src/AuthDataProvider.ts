export const ADMIN_TOKEN_KEY = "admin_token";

const authProvider = {
    login: ({ token } : { token: string }) => {
        if(!token) {
            return Promise.reject("No token provided");
        }

        localStorage.setItem(ADMIN_TOKEN_KEY, token);
        return Promise.resolve();
    },
    logout: () => {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        return Promise.resolve();
    },
    checkError: (error: any) => {
        const status = error.status || error.response?.status;
        if(status === 401) {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            return Promise.reject();
        }
        return Promise.resolve();
    },
    checkAuth: () => {
        return localStorage.getItem(ADMIN_TOKEN_KEY) ? Promise.resolve() : Promise.reject();
    },
    getPermissions: () => Promise.resolve(),
}

export default authProvider;
// import { cookies } from 'next/headers'

interface DecodedToken {
    userID: string
    username: string
    exp: number
}

// export function getAuthData() {
//     const cookieStore = cookies()
//     const token = cookieStore.get('auth_token')?.value

//     if (!token) return null

//     try {
//         const payload = token.split('.')[1]
//         const decoded = JSON.parse(atob(payload)) as DecodedToken

//         return {
//             userID: decoded.userID,
//             username: decoded.username
//         }
//     } catch (error) {
//         console.error('Error decoding token:', error)
//         return null
//     }
// }

export function getAuthDataClient() {
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift();
        }
        return null;
    };

    const token = getCookie('auth_token');
    if (!token) return null;

    try {
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}
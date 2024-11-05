import { cookies } from 'next/headers'

interface DecodedToken {
    userID: string
    username: string
    exp: number
}

export function getAuthData() {
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) return null

    try {
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload)) as DecodedToken

        return {
            userID: decoded.userID,
            username: decoded.username
        }
    } catch (error) {
        console.error('Error decoding token:', error)
        return null
    }
}

export function getAuthDataClient() {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]

    if (!token) return null

    try {
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload)) as DecodedToken

        return {
            userID: decoded.userID,
            username: decoded.username
        }
    } catch (error) {
        console.error('Error decoding token:', error)
        return null
    }
}
export interface AuthPayload {
    userId: number
}

export interface UserResponse {
    id: number
    email: string
}

export interface AuthResponse {
    access_token: string
    user: UserResponse
}

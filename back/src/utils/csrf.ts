import Tokens from "csrf"

const csrfTokens = new Tokens()

const generateCSRFToken = (secret: string): string => {
    return csrfTokens.create(secret)
}

const verifyCSRFToken = (secret: string, token: string): boolean => {
    return csrfTokens.verify(secret, token)
}

const initializeCSRFSecret = (): string => {
    return csrfTokens.secretSync()
}

export { generateCSRFToken, verifyCSRFToken, initializeCSRFSecret }

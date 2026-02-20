import { initializeCSRFSecret, generateCSRFToken, verifyCSRFToken } from "@/utils/csrf.js"

describe("initializeCSRFSecret", () => {
    it("should return a string", () => {
        const secret = initializeCSRFSecret()

        expect(typeof secret).toBe("string")
        expect(secret.length).toBeGreaterThan(0)
    })
})

describe("generateCSRFToken", () => {
    it("should return a token from a secret", () => {
        const secret = initializeCSRFSecret()
        const token = generateCSRFToken(secret)

        expect(typeof token).toBe("string")
        expect(token.length).toBeGreaterThan(0)
    })
})

describe("verifyCSRFToken", () => {
    it("should return true for a valid token", () => {
        const secret = initializeCSRFSecret()
        const token = generateCSRFToken(secret)

        expect(verifyCSRFToken(secret, token)).toBe(true)
    })

    it("should return false for an invalid token", () => {
        const secret = initializeCSRFSecret()

        expect(verifyCSRFToken(secret, "invalid-token")).toBe(false)
    })
})

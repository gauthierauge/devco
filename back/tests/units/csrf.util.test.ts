import { initializeCSRFSecret, generateCSRFToken, verifyCSRFToken } from "@/utils/csrf.js"

describe("initializeCSRFSecret", () => {
    it("doit retourner une string", () => {
        const secret = initializeCSRFSecret()

        expect(typeof secret).toBe("string")
        expect(secret.length).toBeGreaterThan(0)
    })
})

describe("generateCSRFToken", () => {
    it("retourne un token a partir du secret", () => {
        const secret = initializeCSRFSecret()
        const token = generateCSRFToken(secret)

        expect(typeof token).toBe("string")
        expect(token.length).toBeGreaterThan(0)
    })
})

describe("verifyCSRFToken", () => {
    it("retourne true si le token est valide", () => {
        const secret = initializeCSRFSecret()
        const token = generateCSRFToken(secret)

        expect(verifyCSRFToken(secret, token)).toBe(true)
    })

    it("retourne false pour un token invalide", () => {
        const secret = initializeCSRFSecret()

        expect(verifyCSRFToken(secret, "invalid-token")).toBe(false)
    })
})

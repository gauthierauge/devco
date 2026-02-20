import { hashPassword, validatePassword } from "@/utils/password.js"

describe("hashPassword", () => {
    it("doit retourner un hash bcrypt", async () => {
        const hash = await hashPassword("mysecret123")

        expect(typeof hash).toBe("string")
        expect(hash).not.toBe("mysecret123")
        expect(hash).toMatch(/^\$2[aby]\$/)
    })
})

describe("validatePassword", () => {
    it("retourne true pour un mot de passe correct", async () => {
        const hash = await hashPassword("correctpassword")
        const result = await validatePassword("correctpassword", hash)

        expect(result).toBe(true)
    })

    it("retourne false pour un mauvais mot de passe", async () => {
        const hash = await hashPassword("correctpassword")
        const result = await validatePassword("wrongpassword", hash)

        expect(result).toBe(false)
    })
})

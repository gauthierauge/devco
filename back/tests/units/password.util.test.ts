import { hashPassword, validatePassword } from "@/utils/password.js"

describe("hashPassword", () => {
    it("should return a bcrypt hash", async () => {
        const hash = await hashPassword("mysecret123")

        expect(typeof hash).toBe("string")
        expect(hash).not.toBe("mysecret123")
        expect(hash).toMatch(/^\$2[aby]\$/)
    })
})

describe("validatePassword", () => {
    it("should return true for a matching password", async () => {
        const hash = await hashPassword("correctpassword")
        const result = await validatePassword("correctpassword", hash)

        expect(result).toBe(true)
    })

    it("should return false for a wrong password", async () => {
        const hash = await hashPassword("correctpassword")
        const result = await validatePassword("wrongpassword", hash)

        expect(result).toBe(false)
    })
})

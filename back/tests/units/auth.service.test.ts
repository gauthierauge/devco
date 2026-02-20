import { jest } from "@jest/globals"

const mockRepo = {
    findUserByEmail: jest.fn<any>(),
    createUser: jest.fn<any>(),
    findUserById: jest.fn<any>(),
}

const mockPassword = {
    hashPassword: jest.fn<any>(),
    validatePassword: jest.fn<any>(),
}

jest.unstable_mockModule("@/config/db.js", () => ({ prisma: {} }))
jest.unstable_mockModule("@/repositories/user.repository.js", () => mockRepo)
jest.unstable_mockModule("@/utils/password.js", () => mockPassword)
jest.unstable_mockModule("@/config/logger.js", () => ({
    logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

const { authService } = await import("@/services/auth.service.js")

const now = new Date()

describe("register", () => {
    beforeEach(() => jest.clearAllMocks())

    it("doit créer un utilisateur avec un mot de passe hashé", async () => {
        mockRepo.findUserByEmail.mockResolvedValue(null)
        mockPassword.hashPassword.mockResolvedValue("hashed123")
        mockRepo.createUser.mockResolvedValue({ id: 1, email: "test@test.com", password: "hashed123", createdAt: now, updatedAt: now })

        const result = await authService.register("test@test.com", "securePassword!1")

        expect(mockPassword.hashPassword).toHaveBeenCalledWith("securePassword!1")
        expect(mockRepo.createUser).toHaveBeenCalledWith("test@test.com", "hashed123")
        expect(result).toEqual({ id: 1, email: "test@test.com" })
    })

    it("throw 400 si l'email est deja utilisé", async () => {
        mockRepo.findUserByEmail.mockResolvedValue({ id: 1, email: "taken@test.com", password: "hash", createdAt: now, updatedAt: now })

        await expect(authService.register("taken@test.com", "password123"))
            .rejects.toThrow("Email already in use")
    })

    it("throw 400 si le mot de passe fait moins de 15 caracteres", async () => {
        mockRepo.findUserByEmail.mockResolvedValue(null)

        await expect(authService.register("test@test.com", "short"))
            .rejects.toThrow("Password must be at least 15 characters")
    })
})

describe("login", () => {
    beforeEach(() => jest.clearAllMocks())

    it("retourne l'utilisateur si les identifiant sont valides", async () => {
        mockRepo.findUserByEmail.mockResolvedValue({ id: 1, email: "test@test.com", password: "hashed", createdAt: now, updatedAt: now })
        mockPassword.validatePassword.mockResolvedValue(true)

        const result = await authService.login("test@test.com", "password123")

        expect(result).toEqual({ id: 1, email: "test@test.com" })
    })

    it("throw 401 si l'email existe pas", async () => {
        mockRepo.findUserByEmail.mockResolvedValue(null)

        await expect(authService.login("unknown@test.com", "password123"))
            .rejects.toThrow("Invalid email or password")
    })

    it("throw 401 si le mot de passe est incorrect", async () => {
        mockRepo.findUserByEmail.mockResolvedValue({ id: 1, email: "test@test.com", password: "hashed", createdAt: now, updatedAt: now })
        mockPassword.validatePassword.mockResolvedValue(false)

        await expect(authService.login("test@test.com", "wrongpassword"))
            .rejects.toThrow("Invalid email or password")
    })
})

describe("getCurrentUser", () => {
    beforeEach(() => jest.clearAllMocks())

    it("retourne l'utilisateur si il existe", async () => {
        mockRepo.findUserById.mockResolvedValue({ id: 1, email: "test@test.com", password: "hashed", createdAt: now, updatedAt: now })

        const result = await authService.getCurrentUser(1)

        expect(result).toEqual({ id: 1, email: "test@test.com" })
    })

    it("throw 404 si l'utilisateur n'existe pas", async () => {
        mockRepo.findUserById.mockResolvedValue(null)

        await expect(authService.getCurrentUser(999))
            .rejects.toThrow("User not found")
    })
})

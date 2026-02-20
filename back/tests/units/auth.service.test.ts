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

    it("should create a user with a hashed password", async () => {
        mockRepo.findUserByEmail.mockResolvedValue(null)
        mockPassword.hashPassword.mockResolvedValue("hashed123")
        mockRepo.createUser.mockResolvedValue({ id: 1, email: "test@test.com", password: "hashed123", createdAt: now, updatedAt: now })

        const result = await authService.register("test@test.com", "password123")

        expect(mockPassword.hashPassword).toHaveBeenCalledWith("password123")
        expect(mockRepo.createUser).toHaveBeenCalledWith("test@test.com", "hashed123")
        expect(result).toEqual({ id: 1, email: "test@test.com" })
    })

    it("should throw 400 if email is already used", async () => {
        mockRepo.findUserByEmail.mockResolvedValue({ id: 1, email: "taken@test.com", password: "hash", createdAt: now, updatedAt: now })

        await expect(authService.register("taken@test.com", "password123"))
            .rejects.toThrow("Email already in use")
    })

    it("should throw 400 if password is less than 8 characters", async () => {
        mockRepo.findUserByEmail.mockResolvedValue(null)

        await expect(authService.register("test@test.com", "short"))
            .rejects.toThrow("Password must be at least 8 characters")
    })
})

describe("login", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should return the user if credentials are valid", async () => {
        mockRepo.findUserByEmail.mockResolvedValue({ id: 1, email: "test@test.com", password: "hashed", createdAt: now, updatedAt: now })
        mockPassword.validatePassword.mockResolvedValue(true)

        const result = await authService.login("test@test.com", "password123")

        expect(result).toEqual({ id: 1, email: "test@test.com" })
    })

    it("should throw 401 if email does not exist", async () => {
        mockRepo.findUserByEmail.mockResolvedValue(null)

        await expect(authService.login("unknown@test.com", "password123"))
            .rejects.toThrow("Invalid email or password")
    })

    it("should throw 401 if password is incorrect", async () => {
        mockRepo.findUserByEmail.mockResolvedValue({ id: 1, email: "test@test.com", password: "hashed", createdAt: now, updatedAt: now })
        mockPassword.validatePassword.mockResolvedValue(false)

        await expect(authService.login("test@test.com", "wrongpassword"))
            .rejects.toThrow("Invalid email or password")
    })
})

describe("getCurrentUser", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should return the user if found", async () => {
        mockRepo.findUserById.mockResolvedValue({ id: 1, email: "test@test.com", password: "hashed", createdAt: now, updatedAt: now })

        const result = await authService.getCurrentUser(1)

        expect(result).toEqual({ id: 1, email: "test@test.com" })
    })

    it("should throw 404 if user does not exist", async () => {
        mockRepo.findUserById.mockResolvedValue(null)

        await expect(authService.getCurrentUser(999))
            .rejects.toThrow("User not found")
    })
})

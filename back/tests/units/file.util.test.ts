import { jest } from "@jest/globals"

const mockedUnlink = jest.fn<any>()

jest.unstable_mockModule("node:fs/promises", () => ({
    default: { unlink: mockedUnlink },
    unlink: mockedUnlink,
}))
jest.unstable_mockModule("@/config/logger.js", () => ({
    logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

const { deleteUploadedFiles, toFilePath } = await import("@/utils/file.js")

describe("toFilePath", () => {
    it("extrait le basename et construit le chemin vers uploads", () => {
        const result = toFilePath("/uploads/image.jpg")
        expect(result).toMatch(/public[/\\]uploads[/\\]image\.jpg$/)
    })

    it("protège contre le path traversal", () => {
        const result = toFilePath("/../../../etc/passwd")
        expect(result).toMatch(/public[/\\]uploads[/\\]passwd$/)
    })
})

describe("deleteUploadedFiles", () => {
    beforeEach(() => jest.clearAllMocks())

    it("supprime les fichiers existants", async () => {
        mockedUnlink.mockResolvedValue(undefined)

        await deleteUploadedFiles(["/uploads/a.jpg", "/uploads/b.jpg"])

        expect(mockedUnlink).toHaveBeenCalledTimes(2)
        expect(mockedUnlink).toHaveBeenCalledWith(expect.stringContaining("a.jpg"))
        expect(mockedUnlink).toHaveBeenCalledWith(expect.stringContaining("b.jpg"))
    })

    it("ne throw pas si le fichier n'existe pas", async () => {
        mockedUnlink.mockRejectedValue(new Error("ENOENT"))

        await expect(deleteUploadedFiles(["/uploads/missing.jpg"])).resolves.toBeUndefined()
    })

    it("gère un tableau vide", async () => {
        await expect(deleteUploadedFiles([])).resolves.toBeUndefined()
        expect(mockedUnlink).not.toHaveBeenCalled()
    })
})

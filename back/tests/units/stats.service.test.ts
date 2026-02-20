import { jest } from "@jest/globals"

const mockGroupBy = jest.fn<any>()

jest.unstable_mockModule("@/config/db.js", () => ({
    prisma: {
        product: {
            groupBy: mockGroupBy,
        },
    },
}))

const { getProductStats } = await import("@/services/stats.service.js")

describe("getProductStats", () => {
    beforeEach(() => jest.clearAllMocks())

    it("appelle prisma.product.groupBy et transforme le resultat", async () => {
        mockGroupBy.mockResolvedValue([
            { category: "Electronics", _count: { _all: 5 } },
            { category: "Books", _count: { _all: 3 } },
        ])

        const result = await getProductStats()

        expect(mockGroupBy).toHaveBeenCalledWith({
            by: ["category"],
            _count: { _all: true },
        })
        expect(result).toEqual([
            { nom: "Electronics", compte: 5 },
            { nom: "Books", compte: 3 },
        ])
    })

    it("retourne un tableau vide quand il y a pas de produits", async () => {
        mockGroupBy.mockResolvedValue([])

        const result = await getProductStats()

        expect(result).toEqual([])
    })
})

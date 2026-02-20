import { prisma } from "@/config/db.js"

const getProductStats = async () => {
    const rows = await prisma.product.groupBy({
        by: ["category"],
        _count: { _all: true },
    })

    return rows.map((row) => ({
        nom: row.category,
        compte: row._count._all,
    }))
}

export { getProductStats }

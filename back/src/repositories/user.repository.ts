import { prisma } from "../config/db.js"

const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({ where: { email } })
}

const createUser = async (email: string, password: string) => {
    return prisma.user.create({ data: { email, password } })
}

const findUserById = async (id: number) => {
    return prisma.user.findUnique({ where: { id } })
}

export { findUserByEmail, createUser, findUserById }
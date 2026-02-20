import { jest } from "@jest/globals"
import { Request, Response, NextFunction } from "express"
import { xssSanitizer } from "@/middleware/security/xssSanitizer.js"

describe("xssSanitizer", () => {
    it("doit nettoyer les strings avec <script> dans req.body", () => {
        const req = { body: { name: '<script>alert("xss")</script>' } } as Request
        const res = {} as Response
        const next = jest.fn() as NextFunction

        xssSanitizer(req, res, next)

        expect(req.body.name).not.toContain("<script>")
    })

    it("gere les objets imbriqués", () => {
        const req = { body: { user: { name: '<img src=x onerror="alert(1)">' } } } as Request
        const res = {} as Response
        const next = jest.fn() as NextFunction

        xssSanitizer(req, res, next)

        expect(req.body.user.name).not.toContain("onerror")
    })

    it("gere les tableaux", () => {
        const req = { body: { tags: ["<script>evil</script>", "safe"] } } as Request
        const res = {} as Response
        const next = jest.fn() as NextFunction

        xssSanitizer(req, res, next)

        expect(req.body.tags[0]).not.toContain("<script>")
        expect(req.body.tags[1]).toBe("safe")
    })

    it("doit appeler next()", () => {
        const req = { body: { ok: "clean" } } as Request
        const res = {} as Response
        const next = jest.fn() as NextFunction

        xssSanitizer(req, res, next)

        expect(next).toHaveBeenCalled()
    })
})

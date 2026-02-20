jest.mock("@/config/env", () => ({ API_URL: "http://test:5000" }));

import { request } from "../src/api/client";

const BASE_URL = "http://test:5000/api/v1";

describe("request", () => {
    const fetchMock = jest.fn();

    beforeEach(() => {
        fetchMock.mockReset();
        globalThis.fetch = fetchMock;
    });

    it("GET : appelle fetch avec la bonne URL et credentials", async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ data: "ok" }),
        });

        const result = await request(`${BASE_URL}/test`);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/test`, expect.objectContaining({
            method: "GET",
            credentials: "include",
        }));
        expect(result).toEqual({ data: "ok" });
    });

    it("GET : ne fetch pas de CSRF token", async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({}),
        });

        await request(`${BASE_URL}/test`);

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("POST : fetch un CSRF token et l'ajoute dans les headers", async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ csrfToken: "token123" }),
        });
        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ created: true }),
        });

        const result = await request(`${BASE_URL}/test`, { method: "POST" });

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/csrf-token`);
        expect(fetchMock.mock.calls[1][1].headers).toEqual(
            expect.objectContaining({ "x-csrf-token": "token123" })
        );
        expect(result).toEqual({ created: true });
    });

    it("throw si res.ok est false", async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: "Bad Request" }),
        });

        await expect(request(`${BASE_URL}/test`)).rejects.toThrow("Bad Request");
    });

    it("throw avec message generique si pas de JSON dans la reponse erreur", async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => { throw new Error("no json") },
        });

        await expect(request(`${BASE_URL}/test`)).rejects.toThrow("Erreur 500");
    });

    it("retourne undefined pour status 204", async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 204,
        });

        const result = await request(`${BASE_URL}/test`, { method: "GET" });
        expect(result).toBeUndefined();
    });

    it('POST avec credentials: "omit" : ne fetch pas de CSRF token', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ data: "ok" }),
        });

        await request(`${BASE_URL}/test`, { method: "POST", credentials: "omit" });

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});

jest.mock("@/config/env", () => ({ API_URL: "http://test:5000" }));
jest.mock("../src/api/client", () => ({ request: jest.fn() }));

import { listStats } from "../src/api/statsApi";
import { request } from "../src/api/client";

const BASE_URL = "http://test:5000/api/v1";
const mockRequest = jest.mocked(request);

describe("statsApi", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('appelle request avec credentials: "omit"', async () => {
        mockRequest.mockResolvedValueOnce([]);

        await listStats();

        expect(mockRequest).toHaveBeenCalledWith(`${BASE_URL}/stats`, {
            credentials: "omit",
        });
    });
});

export default {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    roots: ["<rootDir>/tests"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    transform: {
        "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
    },
};

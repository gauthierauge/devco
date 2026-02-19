export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    roots: ["<rootDir>/src", "<rootDir>/tests"],
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^@/(.*)\\.js$": "<rootDir>/src/$1",
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
}

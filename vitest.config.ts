import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/__tests__/setup.ts"],
        include: [
            "src/__tests__/**/*.test.ts",
            "src/__tests__/**/*.test.tsx",
        ],
        exclude: ["node_modules", ".next", "e2e"],
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov", "html"],
            include: ["src/**/*.ts", "src/**/*.tsx"],
            exclude: [
                "src/__tests__/**",
                "src/app/**/*.tsx", // Next.js pages (E2E tested)
                "src/app/layout.tsx",
                "src/app/globals.css",
                "node_modules/**",
                ".next/**",
            ],
            thresholds: {
                statements: 80,
                branches: 70,
                functions: 80,
                lines: 80,
            },
        },
    },
});

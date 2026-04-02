export interface VendorSkillMeta {
  official?: boolean;
  source: string;
  skills: Record<string, string>; // sourceSkillName -> outputSkillName
}

/**
 * Repositories to clone as submodules and generate skills from source
 */
export const submodules = {
  vite: "https://github.com/vitejs/vite",
  pnpm: "https://github.com/pnpm/pnpm.io",
  vitest: "https://github.com/vitest-dev/vitest",
};

/**
 * Already generated skills, sync with their `skills/` directory
 */
export const vendors: Record<string, VendorSkillMeta> = {
  "skill-creator": {
    official: true,
    source: "https://github.com/anthropics/skills",
    skills: {
      "skills/skill-creator": "skill-creator",
    },
  },
  turborepo: {
    official: true,
    source: "https://github.com/vercel/turborepo",
    skills: {
      "skills/turborepo": "turborepo",
    },
  },
  "web-design-guidelines": {
    source: "https://github.com/vercel-labs/agent-skills",
    skills: {
      "skills/web-design-guidelines": "web-design-guidelines",
      "skills/react-best-practices": "react-best-practices",
    },
  },
  "tanstack-router": {
    official: true,
    source: "https://github.com/TanStack/router",
    skills: {
      "packages/router-core/skills/router-core": "tanstack-router",
      "packages/react-router/skills/react-router": "tanstack-react-router",
    },
  },
};

/**
 * Hand-written skills with Alexandru Bereghici's preferences/tastes/recommendations
 */
export const manual = ["web-accessibility", "code-standard"];

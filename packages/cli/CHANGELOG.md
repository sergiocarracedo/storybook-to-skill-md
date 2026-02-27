# Changelog

## [1.3.0](https://github.com/sergiocarracedo/storybook-to-skill-md/compare/v1.2.4...v1.3.0) (2026-02-27)


### Features

* add Groq as LLM provider ([056b2e7](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/056b2e79e0488ecea6d7ddf8914cfc8fe2f72e01))

## [1.2.4](https://github.com/sergiocarracedo/storybook-to-skill-md/compare/v1.2.3...v1.2.4) (2026-02-25)


### Bug Fixes

* **cli:** resolve config paths relative to config file and show cached metadata on skip ([d53ef65](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/d53ef655619830c04e45d797bf67d76371da6e30))

## [1.2.3](https://github.com/sergiocarracedo/storybook-to-skill-md/compare/v1.2.2...v1.2.3) (2026-02-25)


### Bug Fixes

* **cli:** use sourceDir as fallback for relative paths and read version from package.json ([5b0c941](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/5b0c9413ac75cf860c40d3f97a610b3b17e72723))

## [1.2.2](https://github.com/sergiocarracedo/storybook-to-skill-md/compare/v1.2.1...v1.2.2) (2026-02-25)


### Bug Fixes

* **cli:** store file paths in .skill-meta.json relative to outputDir ([1fdb065](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/1fdb065b7dc94299fda2b54b09422fc50c260ee9))

## [1.2.1](https://github.com/sergiocarracedo/storybook-to-skill-md/compare/v1.2.0...v1.2.1) (2026-02-25)


### Bug Fixes

* **cli:** remove .skillgenrc.toml from search places (no loader in cosmiconfig v9) ([451f430](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/451f430efae925a4a3379c94b7ee3c57bd3ec705))
* **web:** add not-content class to PackageManagerTabs to prevent Starlight style overrides ([451f430](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/451f430efae925a4a3379c94b7ee3c57bd3ec705))

## [1.2.0](https://github.com/sergiocarracedo/storybook-to-skill-md/compare/v1.1.1...v1.2.0) (2026-02-25)


### Features

* generate deterministic index SKILL.md with optional custom template ([43f3e4e](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/43f3e4e22bbc83bdb8217c46b2a49f36288d6a08))

## [1.1.1](https://github.com/sergiocarracedo/storybook-to-skill-md/compare/v1.1.0...v1.1.1) (2026-02-25)


### Bug Fixes

* propagate release_created output reliably to publish job ([ae397d1](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/ae397d1bbf3053f3a36a6e0d346211589889987a))

## [1.1.0](https://github.com/sergiocarracedo/storybook-to-skill-md/compare/v1.0.5...v1.1.0) (2026-02-24)

### Features

- add .skillgenrc.toml as supported config file name ([a544c6d](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/a544c6d849cee7acb25b7dd2357e121353a85a43))

## [1.0.5](https://github.com/sergiocarracedo/storybook-to-skill-md/compare/v1.0.4...v1.0.5) (2026-02-24)

### Bug Fixes

- exclude CHANGELOG.md from oxfmt format check ([397e23d](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/397e23dbaaec05e339691602e6a0a4e54a7cb9a8))

## [1.0.4](https://github.com/sergiocarracedo/storybook-to-skill-md/compare/v1.0.3...v1.0.4) (2026-02-24)

### Bug Fixes

- fix README formatting, auto-merge release in single workflow run ([6895119](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/68951199ca4f70e1e8f94267b00aff5f61308fd9))

## [1.0.3](https://github.com/sergiocarracedo/storybook-to-skill-md/compare/v1.0.2...v1.0.3) (2026-02-24)

### Bug Fixes

- add missing README.md to published npm package ([1e0b4e4](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/1e0b4e4045252c5ade338e5ca574ad4d1383a8f6))

## [1.0.2](https://github.com/sergiocarracedo/storybook-to-skill-md/compare/v1.0.1...v1.0.2) (2026-02-24)

### Bug Fixes

- fix CI publish workflow to use npm publish for OIDC Trusted Publishing ([495c53a](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/495c53a))
- chain release→publish via workflow_call to bypass GITHUB_TOKEN trigger block ([5014790](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/5014790))

## [1.0.1](https://github.com/sergiocarracedo/storybook-to-skill-md/compare/v1.0.0...v1.0.1) (2026-02-23)

### Bug Fixes

- update oxfmt to 0.34.0 for Node 22 compatibility ([3d1ea27](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/3d1ea27ae5174dd8032bbcdd912adc774a579e27))

## 1.0.0 (2026-02-23)

### Features

- add GitHub Pages workflow, CLI README, and enhanced GitHub Action docs ([9adfd9e](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/9adfd9e78f0d3535468101b6f0ce2ccbd4a50e22))
- add secret scanning with gitleaks and update package name ([c3eb702](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/c3eb702034b528543aedbd2db915ad9726f8a8fa))

### Bug Fixes

- resolve lint errors in CLI package ([7dd22c3](https://github.com/sergiocarracedo/storybook-to-skill-md/commit/7dd22c3edf0d985fedf431924d93a3e54c54b432))

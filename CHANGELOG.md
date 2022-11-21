# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.3-alpha.0](https://github.com/userlike/joke/compare/v2.1.2...v2.1.3-alpha.0) (2022-11-21)

**Note:** Version bump only for package joke





## [2.1.2](https://github.com/userlike/joke/compare/v2.1.1...v2.1.2) (2021-10-09)


### Bug Fixes

* fix broken builds and type errors ([b9a2c63](https://github.com/userlike/joke/commit/b9a2c63c90a7468c02d8f8cdb3cfd94665c70270))





## [2.1.1](https://github.com/userlike/joke/compare/v2.1.0...v2.1.1) (2021-10-09)

**Note:** Version bump only for package joke





# [2.1.0](https://github.com/anilanar/dev/compare/v2.0.0...v2.1.0) (2021-08-31)


### Features

* **joke:** increment allowed jest types version to 27 ([639d842](https://github.com/anilanar/dev/commit/639d842cc8a79420e4f0d85cf5653fd1d7ef16bf))





# [2.0.0](https://github.com/userlike/joke/compare/v2.0.0-alpha.0...v2.0.0) (2020-09-28)

**Note:** Version bump only for package joke





# [2.0.0-alpha.0](https://github.com/userlike/joke/compare/v1.0.2...v2.0.0-alpha.0) (2020-09-23)


### chore

* regen subpkgs with mklib ([a6e3608](https://github.com/userlike/joke/commit/a6e3608ee718f4964329298cb8bcca3ec9845a20))


### Features

* add mockAll ([fa46d77](https://github.com/userlike/joke/commit/fa46d774d1a908e6e849f83d7285b6676887340d)), closes [#11](https://github.com/userlike/joke/issues/11)
* improve mocked types ([8328bdc](https://github.com/userlike/joke/commit/8328bdc8143d71b3c69a299f5e381af1d1b90786)), closes [#13](https://github.com/userlike/joke/issues/13)


### BREAKING CHANGES

* New mocked types carry the risk of breaking existing code
* Removing polyfills can break depending on your node version.





## [1.0.2](https://github.com/anilanar/dev/compare/v1.0.1...v1.0.2) (2020-07-21)

**Note:** Version bump only for package joke





## [1.0.1](https://github.com/anilanar/dev/compare/v1.0.0...v1.0.1) (2020-07-21)

**Note:** Version bump only for package joke





# [1.0.0](https://github.com/anilanar/dev/compare/v0.3.0...v1.0.0) (2020-07-16)


### Bug Fixes

* make @types/jest a peer dependency ([2d7ad17](https://github.com/anilanar/dev/commit/2d7ad17f008308ac3d08570a86d372132872b1d6)), closes [#5](https://github.com/anilanar/dev/issues/5)


### BREAKING CHANGES

* @types/jest has become a peer dependency so if you don't have it in your dependencies, you must add
it now.





# [1.0.0-alpha.0](https://github.com/anilanar/dev/compare/v0.3.0...v1.0.0-alpha.0) (2020-07-01)


### Bug Fixes

* make @types/jest a peer dependency ([109d726](https://github.com/anilanar/dev/commit/109d726d74d8837c42f38be1d3c5a737d9537866)), closes [#5](https://github.com/anilanar/dev/issues/5)


### BREAKING CHANGES

* @types/jest has become a peer dependency so if you don't have it in your dependencies, you must add
it now.





# [0.3.0](https://github.com/userlike/joke/compare/v0.2.0...v0.3.0) (2020-02-26)


### Features

* add mockSome for partial mocking of modules ([0e92c8a](https://github.com/userlike/joke/commit/0e92c8a285de8b0f1ff4fdc57c82e206f8d876fa))





# [0.2.0](https://github.com/userlike/joke/compare/v0.2.0-alpha.3...v0.2.0) (2020-02-26)

**Note:** Version bump only for package joke





# [0.2.0-alpha.3](https://github.com/userlike/joke/compare/v0.2.0-alpha.2...v0.2.0-alpha.3) (2020-02-26)


### Bug Fixes

* **babel:** fix several bugs with 2nd arg of mock ([46ccd54](https://github.com/userlike/joke/commit/46ccd54f8fd37d4750440bbe9192f544b31b604c))





# [0.2.0-alpha.2](https://github.com/userlike/joke/compare/v0.2.0-alpha.1...v0.2.0-alpha.2) (2020-02-24)


### Bug Fixes

* **babel:** fix requireActual wrong param ([27b6140](https://github.com/userlike/joke/commit/27b6140f590a9eb2dc8c1ff9293bfc71279f6360))





# [0.2.0-alpha.1](https://github.com/userlike/joke/compare/v0.2.0-alpha.0...v0.2.0-alpha.1) (2020-02-24)


### Features

* support custom mock implementations ([#1](https://github.com/userlike/joke/issues/1)) ([3eb5d53](https://github.com/userlike/joke/commit/3eb5d530c06949e9b2c93a8e98ae5c58f76597d7))





# [0.2.0-alpha.0](https://github.com/userlike/joke/compare/v0.1.0...v0.2.0-alpha.0) (2020-02-23)


### Features

* **babel:** removes restrictions on mock usage ([9e8b130](https://github.com/userlike/joke/commit/9e8b1304b0e6dc6f4ddf8cc3c19fc762e86216f0))





# [0.1.0](https://github.com/userlike/joke/compare/v0.1.0-alpha.4...v0.1.0) (2020-02-22)

**Note:** Version bump only for package joke





# [0.1.0-alpha.4](https://github.com/userlike/joke/compare/v0.1.0-alpha.3...v0.1.0-alpha.4) (2020-02-22)


### Features

* **babel:** support member expressions ([7e74514](https://github.com/userlike/joke/commit/7e74514af7530db798e97f078fdb52268a2c2f35))
* **babel:** warn user if mock is used in closures ([e24fe4c](https://github.com/userlike/joke/commit/e24fe4ce9834bace7d0d583d31471439232fc87b))





# [0.1.0-alpha.3](https://github.com/anilanar/joke/compare/v0.1.0-alpha.2...v0.1.0-alpha.3) (2020-02-07)


### Features

* **babel:** improve error messages ([dd8b24b](https://github.com/anilanar/joke/commit/dd8b24b85d3dfde5bf1f4a883e1c05f28657eafe))
* **babel:** support assignment to an identifier ([642a30d](https://github.com/anilanar/joke/commit/642a30d22253b1ec0666bec3cd0d956ca1caacc3))
* **babel:** support joke as namespace import ([4fc383c](https://github.com/anilanar/joke/commit/4fc383cfd28d554f89fb0058305fbaaadf656df6))





# [0.1.0-alpha.2](https://github.com/anilanar/joke/compare/v0.1.0-alpha.1...v0.1.0-alpha.2) (2020-02-07)

**Note:** Version bump only for package joke





# [0.1.0-alpha.1](https://github.com/anilanar/joke/compare/v0.1.0-alpha.0...v0.1.0-alpha.1) (2020-02-07)


### Features

* **mocked:** support nested mocking ([331f48b](https://github.com/anilanar/joke/commit/331f48b5de9a61b3b6b30e942a881717af8e7b50))





# 0.1.0-alpha.0 (2020-02-06)


### Features

* happy birthday joke ([de30ad3](https://github.com/anilanar/joke/commit/de30ad331af8294a973a1c3c90023e33201fc290))

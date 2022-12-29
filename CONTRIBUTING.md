# Contributing to ameliorate

🔥🙂 Welcome, and thanks for considering contributing! 🙂🔥

If you're new to open source, you'll probably find [this open source guide](https://opensource.guide/how-to-contribute) useful.

## Code of Conduct

This project adheres to the Contributor Covenant [code of conduct](https://github.com/keyserj/ameliorate/blob/main/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Finding an issue to work on

Check out the [project backlog, filtered for good first issues](https://github.com/users/keyserj/projects/1/views/1?filterQuery=label%3A%22good+first+issue%22). You can remove the filter if you're feeling daring, plucky, or if this isn't your first rodeo. The backlog should be prioritized, but you don't need to limit yourself to the top.

## Running the project

Make sure you have [git](https://git-scm.com/downloads) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

Clone & install dependencies:

```bash
git clone https://github.com/keyserj/ameliorate.git
cd ameliorate
npm install # repo-wide dependencies
cd web
npm install # project-specific dependencies
```

Serve web project on localhost:

```bash
npm run dev # from web/
```

## Codebase overview

Reading up on the tech listed in the [Built with](https://github.com/keyserj/ameliorate#built-with) section of the readme will likely provide useful context.

Known deviations from standard usage of the above tech:

- The directory structure mostly follows the guidance in [this blog post](https://dev.to/vadorequest/a-2021-guide-about-structuring-your-next-js-project-in-a-flexible-and-efficient-way-472) for using modules for a nextjs project, except this is planned to be a mono-repo, so the root contains configs that are expected to be used across projects, and the rest currently lives in web/.
- zustand: [only export custom hooks](https://tkdodo.eu/blog/working-with-zustand#only-export-custom-hooks), and [separate actions from the store](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- emotion: styled components are stored in co-located .styles.tsx files

## Working with the code

Generally, the recommended setup is VS Code from the repo's root directory, with a terminal open in the web/ directory.

Most IDE-related settings are configured for working with vscode from the repo's root directory - known settings that might be problematic if not using vscode in the root directory: [eslint](https://github.com/keyserj/ameliorate/blob/6bd2e83b26b06f6894689ae0a10864743daed771/web/.eslintrc.json#L94), vscode eslint [config](https://github.com/keyserj/ameliorate/blob/6bd2e83b26b06f6894689ae0a10864743daed771/.vscode/settings.json#L5), vscode [tasks](https://github.com/keyserj/ameliorate/blob/main/.vscode/tasks.json).

### Code style

The eslint [config](https://github.com/keyserj/ameliorate/blob/main/web/.eslintrc.json) is pretty strict, most notably the [functional config](https://github.com/keyserj/ameliorate/blob/6bd2e83b26b06f6894689ae0a10864743daed771/web/.eslintrc.json#L42-L52). Strictness here is open for discussion, but being initially strict seemed like a good way to start (and learn some code styling practices, for the case of the extended configs).

To run linting:

```bash
npm run lint # from web/
```

### Conventional commits

[Conventional commits](https://www.conventionalcommits.org/) is a standard format for commit messages, used to aid readability of commit history. This commit message format, with [these commit types](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional), is enforced in a precommit hook via [commitlint](https://github.com/conventional-changelog/commitlint) and [husky](https://github.com/typicode/husky/).

### Helpful VS Code settings

- [extensions](https://github.com/keyserj/ameliorate/blob/main/.vscode/extensions.json) and [settings](https://github.com/keyserj/ameliorate/blob/main/.vscode/settings.json) for syntax highlighting, styling on save, making conventional commits, working with git
- [tasks](https://github.com/keyserj/ameliorate/blob/main/.vscode/tasks.json) - run to view ts & linting errors in the vscode problem window

## PR process

See the open source guide's [Opening a pull request](https://opensource.guide/how-to-contribute/#opening-a-pull-request) for instructions on opening a PR as well as generally-good PR practices.

# Contributing to ameliorate

🔥🙂 Welcome, and thanks for considering contributing! 🙂🔥

All contributors (with GitHub accounts) will be recognized by being added to the [Contributors section](https://github.com/amelioro/ameliorate#contributors-) in the README 🙂. Please feel free to [add yourself](https://allcontributors.org/docs/en/bot/usage#all-contributors-add) if you were missed, or reach out if you prefer not to be acknowledged in this way (reply to the comment that tags you when you're being added).

If you're new to open source, you'll probably find [this open source guide](https://opensource.guide/how-to-contribute) useful.

## Code of Conduct

This project adheres to the Contributor Covenant [code of conduct](https://github.com/amelioro/ameliorate/blob/main/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Providing feedback

There's plenty of room for improvement in this project, and any ideas, suggestions, concerns, etc, are greatly appreciated! Reach out any way you know how, but here are a few mediums you can use:

- [Discord](https://discord.gg/3KhdyJkTWT) - this is a casual way to mention something & have easy back-and-forth; there’s also specifically a channel for #ideas-and-feedback
- [GitHub Issues](https://github.com/amelioro/ameliorate/issues) - slightly more formal than Discord, but this is the system used for managing the project’s work, so if you create an issue, you can track its status
- Email ameliorate.app@gmail.com - easy to use if you’re unfamiliar with Discord/GitHub

And here are some things that come to mind that’d be particularly useful for to share about:

- Anything in the experience that feels awkward
- Bugs
- Feature ideas
- UI design advice
- Problem information that doesn’t feel like it fits within the available node & edge types
- Resources related to reaching mutual understanding & making decisions
- Similar tools
- Coding practices
- Community building

There are also [quite a few ideas](https://github.com/orgs/amelioro/projects/2/views/9) that haven’t been fully thought out that could use some brain power, some specifically [needing technical design](https://github.com/amelioro/ameliorate/labels/needs%20tech%20design) and some [needing feature/UX design](https://github.com/amelioro/ameliorate/labels/needs%20ux%20design).

## Finding an issue to work on

Check out the [first issues filter](https://github.com/orgs/amelioro/projects/2/views/7) in the project backlog - `good first issue`s have a narrow scope and are expected to entail a small number of changes, and `ok first issue`s have a narrow scope, but are expected to be a bit tougher. You can check out the [backlog of all refined issues](https://github.com/orgs/amelioro/projects/2/views/11) if you're feeling daring, plucky, or if this isn't your first rodeo. This list should be prioritized, but you don't need to limit yourself to the top.

Feel free to clarify any issues via commenting on the issue or asking in [Discord](https://discord.gg/3KhdyJkTWT). When you find an issue you want to work on, please comment on it to avoid duplicating work on it.

Note: be particularly wary of [issues with a "needs [x]" label](https://github.com/orgs/amelioro/projects/2/views/9) - these are expected to require significant design efforts.

## Running the project

Make sure you have [git](https://git-scm.com/downloads) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

Clone & install dependencies:

```bash
git clone https://github.com/amelioro/ameliorate.git
cd ameliorate
npm install # repo-wide dependencies
npx husky install # activate commit hooks
cd web
npm install # project-specific dependencies
```

Serve web project on localhost:

```bash
npm run dev # from web/
```

## Codebase overview

Reading up on the tech listed in the [Built with](https://github.com/amelioro/ameliorate#built-with) section of the readme will likely provide useful context.

Known deviations from standard usage of the above tech:

- The directory structure mostly follows the guidance in [this blog post](https://dev.to/vadorequest/a-2021-guide-about-structuring-your-next-js-project-in-a-flexible-and-efficient-way-472) for using modules for a nextjs project, except this is planned to be a mono-repo, so the root contains configs that are expected to be used across projects, and the rest currently lives in web/.
- zustand: see [docs/state-management.md](https://github.com/amelioro/ameliorate/blob/main/web/docs/state-management.md)
- emotion: styled components are stored in co-located .styles.tsx files

## Working with the code

Generally, the recommended setup is VS Code from the repo's root directory, with a terminal open in the web/ directory.

Most IDE-related settings are configured for working with vscode from the repo's root directory - known settings that might be problematic if not using vscode in the root directory: [eslint](https://github.com/amelioro/ameliorate/blob/6bd2e83b26b06f6894689ae0a10864743daed771/web/.eslintrc.json#L94), vscode eslint [config](https://github.com/amelioro/ameliorate/blob/6bd2e83b26b06f6894689ae0a10864743daed771/.vscode/settings.json#L5), vscode [tasks](https://github.com/amelioro/ameliorate/blob/main/.vscode/tasks.json).

### Code style

The eslint [config](https://github.com/amelioro/ameliorate/blob/main/web/.eslintrc.json) is pretty strict, most notably the [functional config](https://github.com/amelioro/ameliorate/blob/6bd2e83b26b06f6894689ae0a10864743daed771/web/.eslintrc.json#L42-L52). Strictness here is open for discussion, but being initially strict seemed like a good way to start (and learn some code styling practices, for the case of the extended configs).

To run linting:

```bash
npm run lint # from web/
```

### UX / UI style

For user experience & user interface design, please read [uxui-guidelines.md](./web/docs/uxui-guidelines.md).

### Conventional commits

[Conventional commits](https://www.conventionalcommits.org/) is a standard format for commit messages, used to aid readability of commit history. This commit message format, with [these commit types](https://github.com/amelioro/ameliorate/blob/main/commitlint.config.js), is enforced in a precommit hook via [commitlint](https://github.com/conventional-changelog/commitlint) and [husky](https://github.com/typicode/husky/).

Note: skip precommit hooks (e.g. if you want to quickly commit a wip) with `git commit --no-verify`.

### Helpful VS Code settings

- [extensions](https://github.com/amelioro/ameliorate/blob/main/.vscode/extensions.json) and [settings](https://github.com/amelioro/ameliorate/blob/main/.vscode/settings.json) for syntax highlighting, styling on save, making conventional commits, working with git; you should be prompted to install these extensions when you open the repo for the first time in vscode
- [tasks](https://github.com/amelioro/ameliorate/blob/main/.vscode/tasks.json) - run to view ts & linting errors in the vscode problem window

## PR process

See the open source guide's [Opening a pull request](https://opensource.guide/how-to-contribute/#opening-a-pull-request) for instructions on opening a PR as well as generally-good PR practices.

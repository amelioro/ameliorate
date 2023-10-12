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

Make sure you have [git](https://git-scm.com/downloads), [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), and [docker](https://docs.docker.com/get-docker/) installed.

Setup:

```bash
git clone https://github.com/amelioro/ameliorate.git
cd ameliorate

# install dependencies, commit hooks, env variables, seed db, build mock-auth server image
# see https://github.com/amelioro/ameliorate/blob/main/scripts/setupLocal.sh
npm run setup:local
```

Serve project on localhost:

```bash
npm run dev # runs postgres container, mock auth server, and the nextjs server
```

The mock authentication server will allow any username and password, and you can log in as any user by using the user's authId as the username. So if you want to log in as, e.g., the [example seeded user](https://github.com/amelioro/ameliorate/blob/b5f6dfcd21c252e57fe03c429e56719b27c980ae/scripts/seed.ts#L16), use "oauth-test-user" as the username.

Update project after pulling new changes:

```bash
# see https://github.com/amelioro/ameliorate/blob/main/scripts/update.sh
npm run update # run new migrations, install new dependencies
```

## Codebase overview

These are diagrams that might help provide high-level views of different pieces of the codebase:

- [Architecture by Environment](https://github.com/amelioro/ameliorate/blob/main/docs/architecture-by-env.md)
- [Database Schema](https://github.com/amelioro/ameliorate/blob/main/docs/database-schema.md)
- [Data Flow](https://github.com/amelioro/ameliorate/blob/main/docs/data-flow.md)

Reading up on the tech listed in the [Built with](https://github.com/amelioro/ameliorate#built-with) section of the readme will likely provide useful context.

Known deviations from standard usage of the above tech:

- zustand: see [docs/state-management.md](https://github.com/amelioro/ameliorate/blob/main/docs/state-management.md)
- emotion: styled components are stored in co-located .styles.tsx files

Core directory structure (here are helpful docs on how nextjs uses directories to serve [pages](https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts) and [api routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)):

```
src/
├─ api/: code for the api server
│ ├─ routers/: defines trpc endpoints
├─ common/: used in both front and back end, e.g. zod schema validations
├─ db/: e.g. migrations, db schema
├─ pages/: nextjs uses this dir to serve pages; these will use code in src/web/
│ ├─ api/: nextjs uses this dir to serve api routes; these will use code in src/api/
│   ├─ trpc/[trpc].page.ts: handles all trpc endpoints defined in src/api/routers/
├─ web/: code for the UI components
```

## Working with the code

Generally, tooling has been set up to work with VS Code.

### Code style

The eslint [config](https://github.com/amelioro/ameliorate/blob/main/.eslintrc.json) is pretty strict, most notably the [functional config](https://github.com/amelioro/ameliorate/blob/6bd2e83b26b06f6894689ae0a10864743daed771/web/.eslintrc.json#L42-L52). Strictness here is open for discussion, but being initially strict seemed like a good way to start (and learn some code styling practices, for the case of the extended configs).

To run linting:

```bash
npm run lint
```

### Commit hooks

This project uses commit hooks to automate some tasks, and these are managed via [husky](https://github.com/typicode/husky/). These tasks live in the [.husky/ directory](https://github.com/amelioro/ameliorate/tree/main/.husky), and are explained below. If you want to skip commit hooks (e.g. if you want to quickly commit a wip), you can run `git commit --no-verify`.

#### Conventional commits

[Conventional commits](https://www.conventionalcommits.org/) is a standard format for commit messages, used to aid readability of commit history. The format is `<type>[optional scope]: <description>` and an example commit message looks like `feat(header): add link to feedback page`. This commit message format, with [these commit types](https://github.com/amelioro/ameliorate/blob/main/commitlint.config.js), is enforced in a commit hook and github action via [commitlint](https://github.com/conventional-changelog/commitlint).

#### Prettier

Code formatting is managed by [prettier](https://prettier.io/), which is automatically run in a commit hook via [lint-staged](https://github.com/okonet/lint-staged).

### UX / UI style

For user experience & user interface design, please read [uxui-guidelines.md](./docs/uxui-guidelines.md).

### Database

Consider using [pg admin](https://www.pgadmin.org/) - it provides a convenient UI for manually managing db schema, viewing data, raw querying, etc.

#### Managing database schema

Use `npm run migration:run` to run migrations on your db that haven't been run yet, and to re-generate the prisma client (i.e. update types for queries based on schema changes). WARNING: this will ask to drop and recreate your db if your schema was modified outside of migrations; you can use `npm run migration:deploy` to run migrations even if your schema has diverged (and then you'll have to run `npx prisma generate` separately to re-generate the prisma client).

If you're writing migrations:

- `npm run migration:rollback` to rollback the last migration that's been run on your db
- `npm run migration:generate` to generate an up & down migration based on changes you've made in `schema.prisma`
- each migration should either fully succeed or fully fail - prefer small migrations, but if you have multiple statements running in one migration, wrap them with `BEGIN;` and `COMMIT;` to ensure the statements are run in a single transaction (note: there's an [open issue](https://github.com/prisma/prisma/issues/15295) to improve error messages when transactions are used - removing these statements can help when debugging migration issues)
- right now, only maintainers have credentials to the test database, so make a comment on the PR or in Discord to request migrations be run on the test database (an easier solution can be considered if this becomes a painpoint)

### Helpful VS Code settings

- [extensions](https://github.com/amelioro/ameliorate/blob/main/.vscode/extensions.json) and [settings](https://github.com/amelioro/ameliorate/blob/main/.vscode/settings.json) for syntax highlighting, styling on save, making conventional commits, working with git; you should be prompted to install these extensions when you open the repo for the first time in vscode
- [tasks](https://github.com/amelioro/ameliorate/blob/main/.vscode/tasks.json) - run to view ts & linting errors in the vscode problem window

## PR process

See the open source guide's [Opening a pull request](https://opensource.guide/how-to-contribute/#opening-a-pull-request) for instructions on opening a PR as well as generally-good PR practices.

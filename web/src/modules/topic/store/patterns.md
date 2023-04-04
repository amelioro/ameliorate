# State Management Patterns

Zustand stores are used to manage front-end state. Check out the [Zustand documentation](https://docs.pmnd.rs/zustand/getting-started/introduction) for details about how it works. There are a few different pieces that make up our state management: the store, its actions, and its hooks.

## The store itself

This has the state in it

## Actions

These are functions that update the state

- generally these should be invoked from a component (e.g. clicking the add node button will invoke the addNode action)
- some actions just read the current state (different from hooks because they don't subscribe to changes)
- these follow the [separate actions from store pattern](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- generally these will look something like

  ```ts
  const action = () => {
    const state = getDuplicateState();

    // do something with the state (usually mutating it because the very-nested state is annoying to update without mutation)

    setState(state, false, "[actionName]");
  };
  ```

## Hooks

These are functions that subscribe to changes in the state

- generally these should be used from a component to render something based on state in the store - when the hook returns a different value, the component will re-render
- these follow the [only export custom hooks pattern](https://tkdodo.eu/blog/working-with-zustand#only-export-custom-hooks), so components shouldn't need to select state (`useStore((state) => state.diagrams)`) from the store directly
- these will look something like

  ```ts
  const useDiagram = (diagramId: string) => {
    return useTopicStore((state) => state.diagrams[diagramId]);
  };
  ```

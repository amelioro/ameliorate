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
    // Using immer's `createDraft` allows us to mutate a draft object instead of the store's current
    // state object.
    const state = createDraft(useTopicStore.getState());

    // Do something with the state (usually mutating it because the very-nested state is annoying to update without mutation).
    // We use this pattern instead of the suggested `setState((state) => [modifiedState])` so that
    // we can use async functions, like `layout`.

    // `finishDraft` returns a new object with all the modifications, and maintains nested object
    // object references for objects that were not modified. This reduces re-renders for hooks that
    // rely on `Object.is` for comparison.
    useTopicStore.setState(finishDraft(state), false, "[actionName]");
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

- note: for hooks that copy an object or create a new array, and therefore have new object/array
  references, consider passing a shallow comparison fn to prevent extra re-renders (see zustand [docs](https://github.com/pmndrs/zustand#selecting-multiple-state-slices))

### Zombie child issue

- hooks should generally not throw errors, particularly due to the [zombie child issue](https://github.com/pmndrs/zustand/issues/302)
  - e.g. if a node is deleted from state, the node's component will have a re-render triggered due to the state change, but hooks looking for that node will not find it; in this case, the hook should just return something that doesn't error - the node's component will soon be removed from the DOM by re-render of the parent Diagram component

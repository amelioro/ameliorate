### Problem(s)

- edges currently point from target to source, which doesn't make sense (note: edges currently always point _upwards_ towards the source)
- "parent" currently describes nodes that are laid out above another node in the diagram, but this is only meaningful half the time - a solution's "parents" are its details, but a problem's details' "parents" are their problem
- some topic edges are labelled inconsistently based on direction - some describe how the source is relating _to_ the target (e.g. causes, creates), and some describe how the target is relating _to_ the source (e.g. created by, subproblem of, obstacle of)
- some topic edges have multiple ways of modeling the same relation - e.g. causes vs creates, creates vs created by (with reverse direction)

### Idea

- edges should point from source to target
- edges should be labelled consistently based on direction, describing how the source is relating _to_ the target
- edges should not have more than one label for describing the same thing
- layout should remain unaffected by these changes (e.g. problems at top of diagram, solutions at bottom of diagram)

### Further motivation

1. effects shouldn't always need to know if they're "problem effects" or "solution effects"
   - e.g. for add buttons (which need to know if we're adding "causes" or "causedBy"), separately in diagram and in summary Cause/Effect columns
   - one place we still need to know this for is for layout, so we can lay problem effects at the top with problems, and solution effects at the bottom with solutions
2. source -> target matches the definition of "source" and "target"
3. "all" column (Incoming | Outgoing) makes a lot more sense

### Use cases that are affected by this change

- want to be able to allow configuring solutions to be at top of diagram and problems at bottom
  - (don't implement this now, but good to keep in mind)
- laying out effects based on whether they're caused by problems or by solutions
  - layout can just traverse the source "cause" edges to see what kind they are
- blue hidden-neighbor handles on nodes should still properly show based on hidden nodes being above or below
  - the "above"/"below" calculation should still generally be based on outgoing/incoming edges, respectively, EXCEPT for problem effects because they are having their "createdBy" edges flipped

### Concerns with migrating

- everything that uses "parents"/"children" and "ancestors"/"descendants" needs to be refactored to use a direction that makes sense
  - we'll have to consider each reference individually
- layout needs to know how to place things top to bottom still
  - e.g. causes and problem effects should be below problems even though some cause -> problem edges point up and problem -> effect edges will point down
  - maybe the most reliable solution is just to manually flip edges before layout to ensure they're the same as they used to be

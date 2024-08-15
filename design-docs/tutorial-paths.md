# Tutorial Paths

This gives an overview of the possible ways of starting a tutorial, and which tutorials will continue from the previous.

```mermaid
flowchart TD
    welcome
    only-start-manually
    auto-start
    auto-start-2[auto-start]
    done

    %% builders
    1-diagram-basics
    2-breakdown
    3-adding-nuance
    4-criteria-table
    5-building-views

    %% viewers
    1a-reading-diagram
    1b-criteria-table
    2-navigating-topic
    3a-criteria-table[1b-criteria-table]
    3b-reading-diagram[1a-reading-diagram]

    %% experts
    more-actions
    advanced-filtering

    auto-start-2 -- opened workspace + <br/> hasn't seen this --> welcome

    welcome -- has edit access --> 1-diagram-basics
    welcome -- no edit access + viewing diagram --> 1a-reading-diagram
    welcome -- no edit access + viewing table --> 1b-criteria-table

    1-diagram-basics --> 2-breakdown
    2-breakdown --> 3-adding-nuance
    3-adding-nuance --> 4-criteria-table
    4-criteria-table --> 5-building-views
    5-building-views --> done

    1a-reading-diagram -- hasn't seen this --> 2-navigating-topic
    1b-criteria-table -- hasn't seen this --> 2-navigating-topic

    2-navigating-topic -- didn't click other format --> done

    2-navigating-topic -- clicked table format + <br/> hasn't seen this --> 3a-criteria-table
    3a-criteria-table --> done

    2-navigating-topic -- clicked diagram format + <br/> hasn't seen this --> 3b-reading-diagram
    3b-reading-diagram --> done

    auto-start -- clicked table format + <br/> hasn't seen this + <br/> tour not open --> 3a-criteria-table
    auto-start -- clicked diagram format + <br/> hasn't seen this + <br/> tour not open --> 3b-reading-diagram
    auto-start-2 -- opened workspace + <br/> has seen welcome + <br/> hasn't seen this + <br/> has edit access --> 1-diagram-basics

    only-start-manually --> more-actions
    more-actions --> done

    only-start-manually --> advanced-filtering
    advanced-filtering --> done

    style only-start-manually stroke:green
    style auto-start stroke:green
    style auto-start-2 stroke:green
    style done stroke:red
```

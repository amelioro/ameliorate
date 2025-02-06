# Tutorial Paths

This gives an overview of the possible ways of starting a tutorial, and which tutorials will continue from the previous.

```mermaid
flowchart TD
    welcome
    only-start-manually
    auto-start
    done

    %% autostart
    autostart-reading-diagram[1a-reading-diagram]
    autostart-criteria-table[1b-criteria-table]

    auto-start -- opened workspace + <br/> hasn't seen this --> welcome

    welcome -- has edit access --> 1-diagram-basics
    welcome -- no edit access + viewing diagram --> diagram-1a-reading-diagram
    welcome -- no edit access + viewing table --> table-1b-criteria-table

    auto-start -- viewed table format + <br/> has seen welcome + <br/> hasn't seen this --> autostart-criteria-table
    auto-start -- viewed diagram format + <br/> has seen welcome + <br/> has no edit access + <br/> hasn't seen this + <br/> hasn't seen Builders path --> autostart-reading-diagram
    auto-start -- opened workspace + <br/> has seen welcome + <br/> has edit access + <br/> hasn't seen this --> 1-diagram-basics

    autostart-reading-diagram --> done
    autostart-criteria-table --> done

    %% builders
    1-diagram-basics
    2-breakdown
    3-adding-nuance
    4-criteria-table
    5-building-views

    subgraph Builders
        1-diagram-basics --> 2-breakdown
        2-breakdown --> 3-adding-nuance
        3-adding-nuance --> 4-criteria-table
        4-criteria-table --> 5-building-views
    end
    5-building-views --> done

    %% diagramViewers
    diagram-1a-reading-diagram[1a-reading-diagram]
    diagram-2-navigating-topic[2-navigating-topic]

    subgraph DiagramViewers["Viewers (diagram)"]
        diagram-1a-reading-diagram --> diagram-2-navigating-topic
    end
    diagram-2-navigating-topic --> done

    %% tableViewers
    table-1b-criteria-table[1b-criteria-table]
    table-2-navigating-topic[2-navigating-topic]

    subgraph TableViewers["Viewers (table)"]
        table-1b-criteria-table --> table-2-navigating-topic
    end
    table-2-navigating-topic --> done

    %% experts
    more-actions
    advanced-filtering

    only-start-manually --> more-actions
    more-actions --> done

    only-start-manually --> advanced-filtering
    advanced-filtering --> done

    %% notes
    subgraph Notes
        note1["Manually starting a tutorial will resume the track that it's in."]
    end

    %% style
    style only-start-manually stroke:green
    style auto-start stroke:green
    style done stroke:red
```

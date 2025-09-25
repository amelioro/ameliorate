# API

## API info for LLMs

You can use `curl 'https://ameliorate.app/api/trpc/topicAI.getPromptData'` to get up-to-date `schemas` and topic `examples`. The schemas are intended for validating LLM output, and the example topics are intended for the LLM to better understand what kind of data to output beyond just what types to use from the schema.

## Using the API directly

All endpoints are open to usage without the UI. See endpoints and their details at https://ameliorate.app/api/panel.

The following sections are assuming you'll interact via cURL. Please [request](https://github.com/amelioro/ameliorate/blob/main/CONTRIBUTING.md#reaching-out) if you're interested in instructions on usage from another programming language, in typesafe querying (potentially via reusing the project's tRPC definitions or via generated openAPI schema), or in a new endpoint you think might be useful.

### Using authenticated endpoints

Authenticated endpoints currently can only be used after authenticating via browser, by logging into Auth0 and getting your cookie

- use Chrome's devtools > Application > Cookies > https://ameliorate.app to grab your `appSession` cookie
- set this value as a variable for easy usage in your future cURL requests:

```bash
APP_SESSION=<value>
```

- future: there are plans to add a user-specific API_KEY for authentication without browser

### Example: Create [VISIBLE-act topic](https://ameliorate.app/keyserj/bill-HR-4667-VISIBLE-act) via API, from scratch

1. Be sure to authenticate for these requests by setting `APP_SESSION` as seen in [Using authenticated endpoints](#using-authenticated-endpoints)

2. Create the topic

```bash
TOPIC_CREATE_DATA='{"topic":{"title":"test-VISIBLE-act","description":"based on bill description https://pluralpolicy.com/app/legislative-tracking/bill/details/federal-119-hr4667/2784356 and Kialo arguments https://www.kialo.com/do-you-support-hr-4667-visible-act-72582","visibility":"private","allowAnyoneToEdit":false},"quickViews":[]}'

TOPIC_CREATE_RESULT=$(curl 'https://ameliorate.app/api/trpc/topic.create' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -b 'appSession='"$APP_SESSION" \
  --data-raw '{"json":'"$TOPIC_CREATE_DATA"'}')
```

- grab the topic id from the response:

```bash
TOPIC_ID=$(echo $TOPIC_CREATE_RESULT | jq '.result.data.json.id')
```

3. Create the desired nodes and edges

```bash
# for this example we're just taking nodes and edges from our example topic
NODES_TO_CREATE=$(curl 'https://ameliorate.app/api/trpc/topicAI.getPromptData' | jq '.result.data.json.examples.visibleAct.topic.nodesToCreate')
EDGES_TO_CREATE=$(curl 'https://ameliorate.app/api/trpc/topicAI.getPromptData' | jq '.result.data.json.examples.visibleAct.topic.edgesToCreate')
# note: the original source text for the topic (in this case, bill text + kialo arguments) can also be found via `jq '.result.data.json.examples.visibleAct.sourceText'`

curl 'https://ameliorate.app/api/trpc/topic.updateDiagram' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -b 'appSession='"$APP_SESSION" \
  --data-raw '{"json":{"topicId":'"$TOPIC_ID"',"nodesToCreate":'"$NODES_TO_CREATE"',"edgesToCreate":'"$EDGES_TO_CREATE"'}}'
```

4. Get the topic data so we can create a view using the solution node's ID

```bash
TOPIC_GETDATA_INPUT_JSON='{"json":{"username":"keyserj","title":"test-VISIBLE-act"}}'
# note: tRPC requires GET inputs to be URI encoded; the below line relies on `jq` to do this, but you can also use `python` or `node` (ask ChatGPT)
TOPIC_GETDATA_INPUT_ENCODED=$(jq -rn --arg v "$TOPIC_GETDATA_INPUT_JSON" '$v|@uri')

TOPIC_GETDATA_RESULT=$(curl 'https://ameliorate.app/api/trpc/topic.getData?input='"$TOPIC_GETDATA_INPUT_ENCODED" \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -b 'appSession='"$APP_SESSION")
```

- grab the solution node id from the response:

```bash
# if generating nodes via LLM, you probably can ask for it to specify the central node with its output
SOLUTION_ID=$(echo "$TOPIC_GETDATA_RESULT" | jq '.result.data.json.nodes | .[] | select(.text=="HR 4667: The VISIBLE Act of 2025") | .id')
```

5. Create the default view you want - in this case a Summary View focused on the solution, with a second view to see the whole diagram

```bash
curl 'https://ameliorate.app/api/trpc/view.handleChangesets' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -b 'appSession='"$APP_SESSION" \
  --data-raw '{"json":{"topicId":'"$TOPIC_ID"',"viewsToCreate":[{"type":"quick","title":"Overview","order":1,"viewState":{"format":"summary","summaryBreadcrumbNodeIds":['"$SOLUTION_ID"'],"selectedSummaryTab":"components"},"topicId":'"$TOPIC_ID"'},{"type":"quick","title":"Diagram","order":2,"viewState":{"format":"diagram","minimizeEdgeCrossings":true,"avoidEdgeLabelOverlap":true},"topicId":'"$TOPIC_ID"'}]}}'
```

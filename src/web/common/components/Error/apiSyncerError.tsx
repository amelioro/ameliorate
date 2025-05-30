import { Divider } from "@mui/material";

export const buildApiSyncerError = (changeLists: Record<string, object[]>, error: unknown) => {
  return (
    <span>
      <b>Failed to save changes.</b>
      <br />
      You can refresh the page and try making your changes again, or download the topic with your
      changes and re-upload it after refreshing the page.
      {error instanceof Error && (
        <>
          <Divider className="my-2" />

          <b>Error details (maybe not be useful):</b>
          <br />
          {error.message}
        </>
      )}
      <Divider className="my-2" />
      <b>Changes that failed to save:</b>
      <pre>
        {JSON.stringify(
          Object.entries(changeLists).filter(([_, changes]) => changes.length > 0),
          null,
          2,
        )}
      </pre>
      <br />
    </span>
  );
};

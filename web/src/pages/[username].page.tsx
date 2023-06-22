import { AutoStories, Delete } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogTitle, IconButton } from "@mui/material";
import MaterialReactTable, { type MRT_ColumnDef } from "material-react-table";
import { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import { apiClient, apiHooks } from "../common/apiClient";

interface RowData {
  id: number;
  title: string;
}

const Topics: NextPage = () => {
  const router = useRouter();
  const username = (router.query.username ?? "") as string; // not string[] because not using catch-all "[...slug]"
  if (router.isReady && username === "")
    throw new Error("Shouldn't have routed to Topics page without username");

  const [deleteDialogRow, setDeleteDialogRow] = useState<RowData | null>(null);

  // how to get local npm installs to install dependencies from the local dir? https://github.com/npm/cli/issues/702
  // need to manually npm i zod @zodios/core to get alias'd hook to work
  const findTopics = apiHooks.useTopicsController_findAllByUsername(
    {
      params: { username: username },
    },
    { enabled: username !== "" }
  );

  const columnData: MRT_ColumnDef<RowData>[] = [
    {
      accessorKey: "title",
      header: "Topic",
    },
  ];

  const rowData: RowData[] =
    findTopics.data?.map((topic) => ({
      id: topic.id,
      title: topic.title,
    })) ?? [];

  return (
    <>
      <MaterialReactTable
        columns={columnData}
        data={rowData}
        enableHiding={false}
        enableRowActions={true}
        renderRowActions={({ row }) => (
          <IconButton
            color="error"
            onClick={(e) => {
              e.stopPropagation(); // prevent row click
              setDeleteDialogRow(row.original);
            }}
          >
            <Delete />
          </IconButton>
        )}
        positionActionsColumn="last"
        renderToolbarInternalActions={() => {
          return (
            <Button
              variant="contained"
              LinkComponent={NextLink}
              href="/new"
              startIcon={<AutoStories />}
            >
              New
            </Button>
          );
        }}
        muiTableBodyRowProps={() => ({
          // TODO: actually associate topic with topic store data
          // muiTableBodyRowProps={({ row }) => ({
          // onClick: () => void router.push(`/${username}/${row.original.title}`),
          onClick: () => void router.push(`/solve`),
          sx: { cursor: "pointer" },
        })}
      />

      <Dialog
        open={!!deleteDialogRow}
        onClose={() => setDeleteDialogRow(null)}
        aria-labelledby="alert-dialog-title"
      >
        {deleteDialogRow && (
          <>
            <DialogTitle id="alert-dialog-title">
              Delete topic {username}/{deleteDialogRow.title}?
            </DialogTitle>
            <DialogActions>
              <Button onClick={() => setDeleteDialogRow(null)}>Cancel</Button>
              <Button
                color="error"
                variant="contained"
                // eslint-disable-next-line @typescript-eslint/no-misused-promises -- idk somehow specify void return here
                onClick={async () => {
                  // RIP zodios generated a bad interface, and no "onSuccess"
                  await apiClient.TopicsController_delete(undefined, {
                    params: { id: deleteDialogRow.id },
                  });
                  await findTopics.invalidate();
                  setDeleteDialogRow(null);
                }}
              >
                Delete Topic
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default Topics;

import { Settings } from "@mui/icons-material";
import { Box, Button, Dialog, IconButton } from "@mui/material";
import {
  type MRT_ColumnDef,
  MRT_ShowHideColumnsButton,
  MRT_ToggleGlobalFilterButton,
  MaterialReactTable,
} from "material-react-table";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

import { type Topic } from "@/db/generated/prisma/client";
import { NotFoundError, QueryError } from "@/web/common/components/Error/Error";
import { Link } from "@/web/common/components/Link";
import { Loading } from "@/web/common/components/Loading/Loading";
import { useSessionUser } from "@/web/common/hooks";
import { trpc } from "@/web/common/trpc";
import { CreateTopicForm, EditTopicForm } from "@/web/topic/components/TopicForm/TopicForm";

type RowData = Topic;

const User: NextPage = () => {
  const router = useRouter();
  // Router only loads query params after hydration, so we can get undefined username here.
  // Value can't be string[] because not using catch-all "[...slug]".
  const username = router.query.username as string | undefined;

  const { sessionUser, isLoading: sessionUserIsLoading } = useSessionUser();

  // could prefetch on the server for performance
  const findUser = trpc.user.findByUsername.useQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- `enabled` guarantees non-null before query is run
    { username: username! },
    { enabled: !!username },
  );

  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [creatingTopic, setCreatingTopic] = useState(false);

  // TODO: use suspense to better handle loading & error
  if (!router.isReady || !username || findUser.isLoading || sessionUserIsLoading)
    return <Loading />;
  if (findUser.error) return <QueryError error={findUser.error} />;
  if (!findUser.data) return <NotFoundError />;

  const foundUser = findUser.data;

  const columnData: MRT_ColumnDef<RowData>[] = [
    {
      accessorKey: "title",
      header: "Topic",
      Cell: ({ row }) => (
        <Link href={`/${foundUser.username}/${row.original.title}`}>{row.original.title}</Link>
      ),
      grow: false,
      size: 250, // fits 30-40 chars which is probably most titles
    },
    {
      accessorKey: "description",
      header: "Description",
      Cell: ({ row }) => (
        <Box
          title={row.original.description}
          sx={{
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {row.original.description}
        </Box>
      ),
    },
    {
      accessorKey: "visibility",
      header: "Visibility",
      grow: false,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      Cell: ({ row }) => (
        <span title={row.original.createdAt.toLocaleString()}>
          {row.original.createdAt.toLocaleDateString()}
        </span>
      ),
      grow: false,
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      Cell: ({ row }) => (
        <span title={row.original.updatedAt.toLocaleString()}>
          {row.original.updatedAt.toLocaleDateString()}
        </span>
      ),
      grow: false,
    },
  ];

  const rowData: RowData[] = foundUser.topics;

  const hasEditAccess = foundUser.id === sessionUser?.id;

  return (
    <>
      <Head>
        <title>{username} | Ameliorate</title>
        <meta name="description" content={`${username} - view your topics.`} />
      </Head>

      <MaterialReactTable
        columns={columnData}
        data={rowData}
        layoutMode="grid"
        enableRowActions={hasEditAccess}
        renderRowActions={({ row }) => (
          <>
            <IconButton
              title="Settings"
              aria-label="Settings"
              onClick={() => setEditingTopicId(row.original.id)}
            >
              <Settings fontSize="inherit" />
            </IconButton>
            <Dialog
              open={editingTopicId === row.original.id}
              onClose={() => setEditingTopicId(null)}
              aria-label="Topic Settings"
            >
              <EditTopicForm topic={row.original} creatorName={foundUser.username} />
            </Dialog>
          </>
        )}
        positionActionsColumn="last"
        renderToolbarInternalActions={({ table }) => {
          return (
            <>
              <MRT_ToggleGlobalFilterButton table={table} />
              <MRT_ShowHideColumnsButton table={table} />

              {hasEditAccess && (
                <>
                  <Button variant="contained" onClick={() => setCreatingTopic(true)}>
                    New Topic
                  </Button>
                  <Dialog
                    open={creatingTopic}
                    onClose={() => setCreatingTopic(false)}
                    aria-label="New Topic"
                  >
                    <CreateTopicForm creatorName={foundUser.username} />
                  </Dialog>
                </>
              )}
            </>
          );
        }}
        initialState={{
          columnVisibility: { visibility: hasEditAccess, createdAt: false },
          sorting: [{ id: "updatedAt", desc: true }],
        }}
      />
    </>
  );
};

export default User;

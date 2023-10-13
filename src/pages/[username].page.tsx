import { AutoStories, Settings } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { Topic } from "@prisma/client";
import {
  type MRT_ColumnDef,
  MRT_ShowHideColumnsButton,
  MRT_ToggleGlobalFilterButton,
  MaterialReactTable,
} from "material-react-table";
import { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";

import { NotFoundError, QueryError } from "../web/common/components/Error/Error";
import { Link } from "../web/common/components/Link";
import { Loading } from "../web/common/components/Loading/Loading";
import { useSessionUser } from "../web/common/hooks";
import { trpc } from "../web/common/trpc";

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
    { enabled: !!username, staleTime: Infinity } // seems fine to have to refresh page to get data that's updated by other users
  );

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
    },
    {
      accessorKey: "visibility",
      header: "Visibility",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      Cell: ({ row }) => (
        <span title={row.original.createdAt.toLocaleString()}>
          {row.original.createdAt.toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      Cell: ({ row }) => (
        <span title={row.original.updatedAt.toLocaleString()}>
          {row.original.updatedAt.toLocaleDateString()}
        </span>
      ),
    },
  ];

  const rowData: RowData[] = foundUser.topics;

  const hasEditAccess = foundUser.id === sessionUser?.id;

  return (
    <>
      <MaterialReactTable
        columns={columnData}
        data={rowData}
        enableRowActions={hasEditAccess}
        renderRowActions={({ row }) => (
          <IconButton
            onClick={(e) => {
              e.stopPropagation(); // prevent row click
              void router.push(`/${foundUser.username}/${row.original.title}/settings`);
            }}
          >
            <Settings />
          </IconButton>
        )}
        positionActionsColumn="last"
        renderToolbarInternalActions={({ table }) => {
          return (
            <>
              <MRT_ToggleGlobalFilterButton table={table} />
              <MRT_ShowHideColumnsButton table={table} />

              {hasEditAccess && (
                <Button
                  variant="contained"
                  LinkComponent={NextLink}
                  href="/new"
                  startIcon={<AutoStories />}
                >
                  New
                </Button>
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

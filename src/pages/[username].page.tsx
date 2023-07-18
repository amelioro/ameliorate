import { AutoStories, Settings } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { Topic } from "@prisma/client";
import { type MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";

import { NotFoundError, QueryError } from "../web/common/components/Error/Error";
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

  const columnData: MRT_ColumnDef<RowData>[] = [
    {
      accessorKey: "title",
      header: "Topic",
    },
  ];

  const rowData: RowData[] = findUser.data.topics;

  const hasEditAccess = findUser.data.id === sessionUser?.id;

  return (
    <>
      <MaterialReactTable
        columns={columnData}
        data={rowData}
        enableHiding={false}
        enableRowActions={hasEditAccess}
        renderRowActions={({ row }) => (
          <IconButton
            onClick={(e) => {
              if (!findUser.data?.username) throw new Error("No username found for redirect");

              e.stopPropagation(); // prevent row click
              void router.push(`/${findUser.data.username}/${row.original.title}/settings`);
            }}
          >
            <Settings />
          </IconButton>
        )}
        positionActionsColumn="last"
        renderToolbarInternalActions={() => {
          return hasEditAccess ? (
            <Button
              variant="contained"
              LinkComponent={NextLink}
              href="/new"
              startIcon={<AutoStories />}
            >
              New
            </Button>
          ) : (
            <></>
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
    </>
  );
};

export default User;

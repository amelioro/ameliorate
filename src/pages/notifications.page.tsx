import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Delete } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { type MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import { NextPage } from "next";
import Head from "next/head";

import { InAppNotification } from "@/common/inAppNotification";
import { Topic } from "@/common/topic";
import { QueryError } from "@/web/common/components/Error/Error";
import { Link } from "@/web/common/components/Link";
import { Loading } from "@/web/common/components/Loading/Loading";
import { trpc } from "@/web/common/trpc";

type RowData = InAppNotification & { topic: Topic };

const Notifications: NextPage = () => {
  const utils = trpc.useContext();

  const findNotifications = trpc.notification.findAll.useQuery(undefined);

  const deleteNotification = trpc.notification.delete.useMutation({
    onMutate: (variables) => {
      const previousNotifications = utils.notification.findAll.getData();

      utils.notification.findAll.setData(undefined, (oldNotifications) => {
        return oldNotifications?.filter((notif) => notif.id !== variables.id);
      });

      return previousNotifications;
    },
    onError: (_err, _variables, previousNotifications) => {
      utils.notification.findAll.setData(undefined, previousNotifications);
    },
  });

  if (findNotifications.isLoading) return <Loading />;
  if (findNotifications.error) return <QueryError error={findNotifications.error} />;

  const notifications = findNotifications.data;

  const columnData: MRT_ColumnDef<RowData>[] = [
    {
      accessorKey: "message",
      header: "Notification",
      Cell: ({ row }) => {
        const { message, topic } = row.original;

        return (
          <div className="flex flex-col">
            <div className="flex">
              <Link href={`/${topic.creatorName}`}>{topic.creatorName}</Link>/
              <Link href={`/${topic.creatorName}/${topic.title}`}>{topic.title}</Link>
            </div>
            <p>{message}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "sourceUrl",
      header: "Source",
      Cell: ({ row }) => <Link href={row.original.sourceUrl}>view comment</Link>,
      grow: false,
    },
    {
      accessorKey: "reason",
      header: "Reason",
      grow: false,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      Cell: ({ row }) => (
        // TODO?: use relative date
        <span title={row.original.createdAt.toLocaleString()}>
          {row.original.createdAt.toLocaleDateString()}
        </span>
      ),
      grow: false,
    },
  ];

  const rowData: RowData[] = notifications;

  return (
    <>
      <Head>
        <title>Notifications | Ameliorate</title>
        <meta name="description" content="View your notifications." />
      </Head>

      <Typography variant="h5" className="mx-auto my-3">
        Notifications
      </Typography>

      <MaterialReactTable
        columns={columnData}
        data={rowData}
        layoutMode="grid"
        enableRowActions={true}
        renderRowActions={({ row }) => (
          <IconButton onClick={() => deleteNotification.mutate({ id: row.original.id })}>
            <Delete />
          </IconButton>
        )}
        positionActionsColumn="last"
        enableToolbarInternalActions={false}
        enableTopToolbar={false}
        initialState={{
          sorting: [{ id: "createdAt", desc: true }],
        }}
      />
    </>
  );
};

export default withPageAuthRequired(Notifications);

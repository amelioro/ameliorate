import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Delete } from "@mui/icons-material";
import { FormControlLabel, IconButton, Switch as MuiSwitch, Typography } from "@mui/material";
import { type MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import Head from "next/head";

import { InAppNotification } from "@/common/inAppNotification";
import { Topic } from "@/common/topic";
import { QueryError } from "@/web/common/components/Error/Error";
import { Link } from "@/web/common/components/Link";
import { Loading } from "@/web/common/components/Loading/Loading";
import { useSessionUser } from "@/web/common/hooks";
import { trpc } from "@/web/common/trpc";

type RowData = InAppNotification & { topic: Topic | null };

export default withPageAuthRequired(({ user }) => {
  const utils = trpc.useContext();

  // `user` gives us guaranteed authId, but we need our session user to get at Ameliorate-specific user fields
  const { sessionUser } = useSessionUser();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const authId = user.sub!;

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

  const setReceiveEmails = trpc.user.setReceiveEmails.useMutation({
    onMutate: (variables) => {
      const previousUser = utils.user.findByAuthId.getData({ authId });
      if (!previousUser) throw new Error("should've loaded a user before setting email preference");

      utils.user.findByAuthId.setData(
        { authId },
        { ...previousUser, receiveEmailNotifications: variables.receiveEmailNotifications },
      );

      return previousUser;
    },
    onError: (_err, _variables, previousUser) => {
      utils.user.findByAuthId.setData({ authId }, previousUser);
    },
  });

  if (!sessionUser || findNotifications.isLoading) return <Loading />;
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
              {topic ? (
                <>
                  <Link href={`/${topic.creatorName}`}>{topic.creatorName}</Link>/
                  <Link href={`/${topic.creatorName}/${topic.title}`}>{topic.title}</Link>
                </>
              ) : (
                "(Topic not found)"
              )}
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

      <FormControlLabel
        label={<Typography>Receive Email Notifications</Typography>}
        control={
          <MuiSwitch
            checked={sessionUser.receiveEmailNotifications}
            onChange={(_event, checked) =>
              setReceiveEmails.mutate({ receiveEmailNotifications: checked })
            }
          />
        }
        className="mb-2 ml-2"
      />

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
});

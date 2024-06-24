import { Typography } from "@mui/material";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Head from "next/head";

import { unsubscribe } from "@/api/notifications/subscription";
import { Link } from "@/web/common/components/Link";

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ unsubscribeCode: string }>,
) => {
  const unsubscribed = await unsubscribe(context.params?.unsubscribeCode ?? "");

  return { props: { unsubscribed } };
};

export default function Page({
  unsubscribed,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // Seems ok if we say it's expired even if the code was never valid
  const unsubscribeText = unsubscribed
    ? "You have been successfully unsubscribed"
    : "Unsubscribe link has expired";

  return (
    <>
      <Head>
        <title>Unsubscribe | Ameliorate</title>
        <meta name="description" content="Unsubscribe from Ameliorate notifications." />
      </Head>

      <Typography variant="h5" textAlign="center" sx={{ margin: 2 }}>
        {unsubscribeText}. Go to your <Link href="/notifications">notifications page</Link> to
        manage your notifications.
      </Typography>
    </>
  );
}

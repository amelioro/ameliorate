/* eslint-disable functional/no-let -- let is needed to reuse `before`-initialized variables across tests */
import { Topic, User } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { beforeEach, expect, test, vi } from "vitest";

import { xprisma } from "@/db/extendedPrisma";
import { getServerSideProps } from "@/pages/sitemap-generated.xml.page";
import { testEmail } from "~/scripts/setupTests";

let user1: User;
let user2: User;
let _user1PublicTopic: Topic;
let _user1UnlistedTopic: Topic;
let _user1PrivateTopic: Topic;
let _user2PublicTopic: Topic;
let _user2UnlistedTopic: Topic;
let _user2PrivateTopic: Topic;

const user1Date = new Date("2024-11-20");
const user2Date = new Date("2023-05-15");

beforeEach(async () => {
  user1 = await xprisma.user.create({
    data: { username: "user1", authId: "user1", email: testEmail },
  });
  user2 = await xprisma.user.create({
    data: { username: "user2", authId: "user2", email: testEmail },
  });

  _user1PublicTopic = await xprisma.topic.create({
    data: {
      title: "publicTopic",
      creatorName: user1.username,
      visibility: "public",
      updatedAt: user1Date,
    },
  });
  _user1UnlistedTopic = await xprisma.topic.create({
    data: {
      title: "unlistedTopic",
      creatorName: user1.username,
      visibility: "unlisted",
      updatedAt: user1Date,
    },
  });
  _user1PrivateTopic = await xprisma.topic.create({
    data: {
      title: "privateTopic",
      creatorName: user1.username,
      visibility: "private",
      updatedAt: user1Date,
    },
  });

  _user2PublicTopic = await xprisma.topic.create({
    data: {
      title: "publicTopic",
      creatorName: user2.username,
      visibility: "public",
      updatedAt: user2Date,
    },
  });
  _user2UnlistedTopic = await xprisma.topic.create({
    data: {
      title: "unlistedTopic",
      creatorName: user2.username,
      visibility: "unlisted",
      updatedAt: user2Date,
    },
  });
  _user2PrivateTopic = await xprisma.topic.create({
    data: {
      title: "privateTopic",
      creatorName: user2.username,
      visibility: "private",
      updatedAt: user2Date,
    },
  });
});

test("includes public topics, and excludes unlisted and private topics", async () => {
  let createdSitemap = "";

  const res = {
    setHeader: vi.fn(),
    write: (text: string) => (createdSitemap = text),
    end: vi.fn(),
  };

  const context: GetServerSidePropsContext = { res } as unknown as GetServerSidePropsContext;

  await getServerSideProps(context);

  // expect(createdSitemap).toMatchSnapshot();
  expect(createdSitemap).toMatchInlineSnapshot(`
    "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>
    <urlset xmlns=\\"http://www.sitemaps.org/schemas/sitemap/0.9\\">
    <url><loc>http://localhost:3000</loc><changefreq>daily</changefreq><priority>1</priority></url>
    <url><loc>http://localhost:3000/playground</loc><changefreq>daily</changefreq></url>
    <url><loc>http://localhost:3000/user1/publicTopic</loc><changefreq>daily</changefreq><lastmod>2024-11-20T00:00:00.000Z</lastmod></url>
    <url><loc>http://localhost:3000/user2/publicTopic</loc><changefreq>daily</changefreq><lastmod>2023-05-15T00:00:00.000Z</lastmod></url>
    </urlset>"
  `);
});

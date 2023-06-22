import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type Topic = {
  user?: User | undefined;
  id: number;
  title: string;
};
type User = {
  topics?: Array<Topic> | undefined;
  id: number;
  username: string;
  authId: string;
};

const CreateUserDto = z.object({ username: z.string(), authId: z.string() });
const CreateTopicDto = z.object({ title: z.string() });
const User: z.ZodType<User> = z.lazy(() =>
  z.object({
    topics: z.array(Topic).optional(),
    id: z.number(),
    username: z.string().regex(/\/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$\/i/),
    authId: z.string(),
  })
);
const Topic: z.ZodType<Topic> = z.lazy(() =>
  z.object({
    user: User.optional(),
    id: z.number(),
    title: z.string().regex(/\/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,99}$\/i/),
  })
);

export const schemas = {
  CreateUserDto,
  CreateTopicDto,
  User,
  Topic,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/topics",
    alias: "TopicsController_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ title: z.string() }),
      },
    ],
    response: Topic,
  },
  {
    method: "delete",
    path: "/api/topics/:id",
    alias: "TopicsController_delete",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/topics/:username",
    alias: "TopicsController_findAllByUsername",
    requestFormat: "json",
    parameters: [
      {
        name: "username",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.array(Topic),
  },
  {
    method: "get",
    path: "/api/topics/:username/:title",
    alias: "TopicsController_findByUsernameAndTitle",
    requestFormat: "json",
    parameters: [
      {
        name: "username",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "title",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Topic,
  },
  {
    method: "post",
    path: "/api/users",
    alias: "UsersController_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateUserDto,
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/users/authId/:authId",
    alias: "UsersController_findByAuthId",
    requestFormat: "json",
    parameters: [
      {
        name: "authId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/users/username/:username",
    alias: "UsersController_findByUsername",
    requestFormat: "json",
    parameters: [
      {
        name: "username",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

import { prisma } from "./basePrisma";

// can add extensions like
// export const xprisma = prisma.$extends(componentExtension).$extends(topicExtension);
// see docs for defining the extensions https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions/shared-extensions#define-an-extension
// probably put extensions in db/extensions/

export const xprisma = prisma;

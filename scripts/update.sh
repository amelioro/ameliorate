# update db - needed if new migrations are added
npm run migration:deploy

# update new dependencies - needed if package.json changes
# also runs postinstall hook to generate prisma files - needed if schema changes
npm install

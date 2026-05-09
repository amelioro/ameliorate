const meta = {
  // Disable breadcrumbs, timestamps, and use article typesetting for all blog pages
  "*": {
    theme: {
      breadcrumb: false,
      timestamp: false,
      typesetting: "article",
    },
  },
  index: {
    title: "All Posts",
  },
  posts: {
    title: "Posts",
    // Hide the "posts" folder from the navbar, only show in sidebar
    display: "children",
  },
};

export default meta;

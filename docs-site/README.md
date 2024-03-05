# Ameliorate Docs

## Setup

```bash
npm i
npm run dev # deploys to localhost:3008/docs
```

## Images

Images are mostly remotely hosted on GitHub, since their sizes would be a big chunk compared to the rest of the repo. Next.js Image optimization is used to reduce loading size for users, and to prevent layout shift, but since the images are remote, widths and heights [must be specified explicitly](https://nextjs.org/docs/app/building-your-application/optimizing/images#remote-images). Example:

```tsx
<Image
  src="https://github.com/amelioro/ameliorate/assets/13872370/e0a8b631-d759-4959-9400-e12f52b17531"
  width={832}
  height={500}
/>
```

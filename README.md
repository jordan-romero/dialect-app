This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, install necessary dependencies:

```bash
yarn install
```

You can run the local development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## NextJs & Typescript

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

This project use [Typescript](https://www.typescriptlang.org/docs/)

## Styled using ChakraUi

[ChakraUi Docs](https://chakra-ui.com/docs/components)

To utilize custom styling, navigate to `components/theme/theme.ts`

## Large File Storage

For large file storage such as videos or things that we know will exceed github's limitations we are using [GitLfs](https://git-lfs.com/)

You will have to install the package on your local machine:

```bash
brew install git-lfs
```

Once initalized you will need to run the command (only the during initial setup):

```bash
git lfs install
```

To add file times to the `.gitattributes` file you can run:

```bash
git lfs track "*.psd"
```

Changing the type of file (ex. "\*.psd") to the necessary file type

## Database 

Using [Supabase](https://supabase.com/dashboard/project/tmhgzuhrjfbppddufgld)

Setting up Supabase for [local development](https://supabase.com/docs/guides/getting-started/local-development) 

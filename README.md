This is the Grow your own story  webapp, a  [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Dependencies

This project uses google's Firebase (Firestore Database for logging, and storing the json files used to drive a story and Storage to store the audio files).  You need to set up your own Google Firebase account and enable it.  To test locally, create an .env.local file in the project's top level dir and give it the necessary credentials:

FIREBASE_PROJECT_ID=myprojectid
FIREBASE_PRIVATE_KEY="--firebase private key--"
FIREBASE_CLIENT_EMAIL=something.iam.gserviceaccount.com
BUCKETID=gs://something.appspot.com/


## Testing locally

To run locally:

```bash
npm run dev
# or
yarn dev
```

## Deploy on Vercel

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js. You'll need to set the environment variables (i.e.FIREBASE_PROJECT_ID,FIREBASE_PRIVATE_KEY,FIREBASE_CLIENT_EMAIL,BUCKETID) on the Vercel project settings page and then re-deploy.

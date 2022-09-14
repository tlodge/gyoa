import admin from '../../lib/firebase';

export default async (req, res) => {
  const firebase = admin.firestore();
  const { id, type, data} = req.query;
  const ts = Date.now();
  const log = {ts,id,type,data}
  console.log(log);
  const scriptRef = firebase.collection("logs").doc()
  await scriptRef.set(log);
  res.status(200).json({success:true});
}
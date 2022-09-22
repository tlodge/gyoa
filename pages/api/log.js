import admin from '../../lib/firebase';

export default async (req, res) => {
  const firebase = admin.firestore();
  const { bts, id, type, data} = req.body;
  const ts = Date.now();
  const log = {ts,bts,id,type,data}
  console.log(log);
  if (bts, data && id && type){
    const scriptRef = firebase.collection("logs").doc()
    await scriptRef.set(log);
  }
  res.status(200).json({success:true});
}
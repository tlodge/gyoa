// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import admin from '../../lib/firebase';
const storage = admin.storage();
const mybucket = storage.bucket(process.env.BUCKETID);

export default async (req, res) => {
  const {folder, id=""} = req.query;
  try{
    const file = await mybucket.file(`${folder}/${id}`).download();
    const data = Buffer.from(file[0], 'base64').toString('ascii');
    res.status(200).json(data)
  }catch(err){
    res.status(200).json("");
  }
}
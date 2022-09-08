import admin from '../../lib/firebase';
const storage = admin.storage();

export const config = { api: { bodyParser: { sizeLimit: '4.5mb' } } }
const mybucket = storage.bucket(process.env.BUCKETID);

const allowCors = fn => async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    // another common pattern
    // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    if (req.method === 'OPTIONS') {

      res.status(200).end()
      return
    }
    return await fn(req, res)
  }
  
  const handler = async (req, res) => {
    
    if (req.method === "POST"){
        
        const {folder, id, data} = req.body;
        mybucket.file(`${folder}/${id}`).save(data);
    }
    res.end()
  }
  
export default allowCors(handler)
  
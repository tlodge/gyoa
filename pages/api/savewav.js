import admin from '../../lib/firebase';


export const config = { api: { bodyParser: { sizeLimit: '4.5mb' } } }


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
    console.log("seen incoming save request");
    if (req.method === "POST"){   
        console.log("it is a post method");     
        const storage = admin.storage();
        const mybucket = storage.bucket(process.env.BUCKETID);
        const {folder, id, data} = req.body;
        console.log("have folder", folder, " and id", id);
        await mybucket.file(`${folder}/${id}`).save(data).catch((err)=>console.log(err));
       console.log("successfully uploaded file!");
    }
    res.end()
  }
  
export default allowCors(handler)
  
export default async function handler(req, res) {
    const pdata = req.body;
    const gdata = req.query;
    console.log(pdata);
    console.log(gdata);
    res.status(200).json({ hello: 'person' })
}
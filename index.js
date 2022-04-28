const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app=express();

//mddlewar
app.use(cors());
app.use(express.json());



const port=process.env.PORT || 5000;




function verifyJWT(req,res,next)
{
    const authHeader=req.headers.authorization;
           
            if(!authHeader)
            {
                return res.status(401).send({message:'unauthorized acccess'})
            }

            const token=authHeader.split(' ')[1];
            jwt.verify(token,process.env.ACCESS_TOKEN_SECRETE,(err,decoded)=>{
                if(err)
                {
                    return res.status(403).send({message:'forbidden'})
                }
                console.log('decoded',decoded);
                req.decoded=decoded;
                next();
            })



           


}




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kfeti.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run()
{
    try{
        await client.connect();
        const serviceCollection=client.db('burgerHut').collection('supply');
        const orderCollection=client.db('burgerHut').collection('order')


        //auth

        app.post('/login',async(req,res)=>
        
        {
            const user=req.body;
            const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRETE,{
                expiresIn:'1d'
            });

            res.send(accessToken);

        })









        //burger api

       
        app.get('/service',async(req,res)=>
        {
          

            const query={};
            const cursor=serviceCollection.find(query);
            const services= await cursor.toArray();
            res.send(services);
           

           
           

           


          

        });

        app.get('/service/:id',async(req,res)=>
        {
     

        const id=req.params.id;
        const query={_id :ObjectId(id)};
        const service=await serviceCollection.findOne(query);
        res.send(service);
      
       

        })


        app.post('/service',async(req,res)=>{
            const newBurger=req.body;
            const result=await serviceCollection.insertOne(newBurger); 
            res.send(result);
        })

        app.delete('/service/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const result=await serviceCollection.deleteOne(query)
            res.send(result);
        })



        //create order api

        app.post('/order',async(req,res)=>
        {
            const query=req.body;
            const orders=await orderCollection.insertOne(query);
            res.send(orders);

        })

        app.get('/order',verifyJWT,async(req,res)=>{
            const decodedEmail=req.decoded.email;
            
            const email=req.query.email;
            console.log(email);
          if(decodedEmail===email)
          {
            const query={email: email};
            const cursor= orderCollection.find(query);
            const orders= await cursor.toArray(cursor);
            res.send(orders);
          }
          else{
              res.status(403).send({message:'forbidden access'})
          }
        })

    }
    finally{

    }

}
 
run().catch(console.dir);

app.get('/',(req,res)=>
{
    res.send("burger hut is running");
})


app.listen(port,()=>
{
    console.log('listening to port',port);
})
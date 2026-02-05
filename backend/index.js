import dotenv from 'dotenv'
import connectToDB from './config/db.js'
import app from './app.js'

dotenv.config({
    path: '/env'  // if giving prob try "./.env"
})


connectToDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server started at http://localhost:${process.env.PORT || 8000}`);
    })
})
.catch((error) => console.log("MONGODB connection failed!!!: ", error))

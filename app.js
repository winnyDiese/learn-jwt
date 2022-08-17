
// Import
const jwt = require('jsonwebtoken')
const express = require('express')
const app = express()
require('dotenv').config()


// Config
app.use(express.json())
app.use(express.urlencoded({extended: true}))


// Create a user
const user = {
    id: 42,
    name: 'Jambon Khen',
    email: 'jambon@gmail.com',
    admi: true
}


// creation func for generate a token
const generateAccessToken = user =>{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1800s'})
}

const generateRefreshToken = user =>{
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1y'})
}

// Route rafrechir Token
app.get('/api/refreshToken', (req, res)=>{
    const authorization = req.header('authorization')
    const token = authorization && authorization.split(' ')[1] // 'Berear token'

    if(!token){
        return res.sendStatus(401)
    }

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
        if(err) return res.sendStatus(401)
        
        // Todo check a Bdd, si le user a toujours le droit, et qu'il existe toujours

        delete user.iat
        delete user.exp
        const refreshToken = generateAccessToken(user)

        res.send({
            accessToken: refreshToken
        })
    })

})


// Route Login
app.post('/api/login/', (req, res)=>{

    // Todo : checker en base le user, par rapport a email
    if(req.body.email != user.email){
        res.status(401).send('Invalid email')
        return
    }
    
    if(req.body.password != 'cueilleur'){
        res.status(401).send('Invalid pa<ssword')
        return
    }

    // Generate a token
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    res.send({accessToken, refreshToken})

})


// Verification de l'authentification du TOKEN
const authenticateToken = (req, res, next)=>{
    const authorization = req.header('authorization')
    const token = authorization && authorization.split(' ')[1] // 'Berear token'

    if(!token){
        return res.sendStatus(401)
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        if(err) return res.sendStatus(401)

        req.user = user
        next()
    })

}

// Routes me
app.get('/api/me', authenticateToken, (req, res)=>{
    res.send(req.user)
})

app.listen(3000, ()=>{console.log('Server running port 3000 ')})




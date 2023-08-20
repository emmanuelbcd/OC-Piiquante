//l'objectif de ce middleware est de vérifier que la requête à l'API est bien authentifiée 
// à l'aide du token JWT JSON Web Token

//Lorsqu'un utilisateur essaie d'accéder à certaines routes qui nécessitent une authentification,
//la requête passe par ce middleware.
//si l'utilisateur est authentifié (c-à-d qu'il a fourni un token valide), il peut continuer.
//sinon, il reçoit une réponse d'erreur.

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Authorization token missing!' });
        }
        const token = req.headers.authorization.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET;
        const decodedToken = jwt.verify(token, jwtSecret);
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    } catch(error) {
        console.log(error);
        res.status(401).json( { message: 'Une erreur est survenue !' } );
    }
};



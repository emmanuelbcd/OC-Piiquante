const jwt = require('jsonwebtoken'); //importation de jsonwebtoken

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // on récupère notre token
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // on décode notre token avec la méthode verify
        const userId = decodedToken.userId; // on récupère le userId
        req.auth = {
            userId: userId
        };
        next();
    } catch(error) {
        res.status(401).json( { message: 'Une erreur est survenue !' } );
    }
};
const jwt = require('jsonwebtoken'); //importation de jsonwebtoken

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // on récupère notre token
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // on décode notre token avec la méthode verify
        const userId = decodedToken.userId; // on récupère le userId
        req.auth = {
            userId: userId
        };
    } catch(error) {
        res.status(401).json( { error } );
    }
};
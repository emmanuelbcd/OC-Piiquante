const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Authorization token missing!' });
        }
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
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



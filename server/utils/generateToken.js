const jwt = require("jsonwebtoken");
const generateToken = (create) => {
    return token = jwt.sign({ email: create.email, id: create._id, _id: create._id, role: create.role }, process.env.JWT_KEY);
}
module.exports.generateToken = generateToken;

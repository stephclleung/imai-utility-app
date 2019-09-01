const app = require('./app');
require('dotenv').config();
const PORT = process.env.PORT //|| 5002;
console.log(`App at port ${PORT}`)

app.listen(PORT, () => {
    console.log(`Server up at ${PORT}`);
})

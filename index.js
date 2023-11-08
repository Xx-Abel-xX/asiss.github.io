var express = require('express');
var cors = require('cors');
var app = express();

const whileList = ["http://localhost:3000/"]

app.use(cors({origin: whileList}));

app.get('/ruta', function (req, res, next) {
  res.json({msg: 'Habilitado CORS para todas las rutas'});
})
const port = 3000;
app.use(express.static(__dirname));

app.listen(port, () => console.log(`Server started on port localhost:${port}`));

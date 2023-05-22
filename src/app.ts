import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';

const app: Express = express();

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  const today = new Date().getDay();
  if (today === 6 || today === 0) {
    res.write("<p>Yay it's the weekend!</p>");
    res.write('<h1>I can do what I want</h1>');
  } else {
    // res.write('<h1>It is not the weekend</h1>');
    // res.write('<p>Boo! I have to work!</p>');
    res.sendFile(__dirname + '/index.html');
  }
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

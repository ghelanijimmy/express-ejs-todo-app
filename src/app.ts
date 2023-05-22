import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';

const app: Express = express();

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

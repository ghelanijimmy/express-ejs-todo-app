import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { getDate } from './utils/date';

const app: Express = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../', 'public')));

const items: string[] = ['Buy Food', 'Cook Food', 'Eat Food'];
const workItems: string[] = [];

app.get('/', (req: Request, res: Response) => {
  res.render('list', { listTitle: getDate(), items });
});

app.post('/', (req: Request<{ newItem: string }>, res: Response) => {
  const { newItem } = req.body;
  if (req.body.list === 'Work') {
    workItems.push(newItem);
    res.redirect('/work');
  } else {
    items.push(newItem);
    res.redirect('/');
  }
});

app.get('/work', (req: Request, res: Response) => {
  res.render('list', { listTitle: 'Work List', items: workItems });
});

app.post('/work', (req: Request<{ newItem: string }>, res: Response) => {
  const { newItem } = req.body;
  workItems.push(newItem);
  res.redirect('/work');
});

app.get('/about', (req: Request, res: Response) => {
  res.render('about');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

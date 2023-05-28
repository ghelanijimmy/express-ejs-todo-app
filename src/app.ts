import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import * as mongoose from 'mongoose';

const app: Express = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../', 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB').then(() => {
  console.log('Connected to MongoDB');
});

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please check your data entry, no name specified!'],
  },
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: 'Welcome to your todolist!',
});

const item2 = new Item({
  name: 'Hit the + button to add a new item.',
});

const item3 = new Item({
  name: '<-- Hit this to delete an item.',
});

const defaultItems = [item1, item2, item3];

const items: string[] = [];
const workItems: string[] = [];

app.get('/', (req: Request, res: Response) => {
  Item.find().then((foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(() => {
        console.log('Successfully saved default items to DB.');
      });
      res.redirect('/');
    }
    res.render('list', { listTitle: 'Today', items: foundItems });
  });
});

app.post('/', (req: Request<{ newItem: string }>, res: Response) => {
  const { newItem, list } = req.body;
  const item = new Item({
    name: newItem,
  });
  item.save().then(() => {
    res.redirect('/');
  });
});

app.post('/delete', (req: Request<{ checkedItemId: string }>, res: Response) => {
  const { checkedItemId } = req.body;
  Item.findByIdAndDelete(checkedItemId).then(() => {
    console.log('Successfully deleted checked item.');
    res.redirect('/');
  });
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

import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import * as mongoose from 'mongoose';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import _ from 'lodash';

const app: Express = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../', 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB').then(() => {
  console.log('Connected to MongoDB');
});

export interface TypedRequestBody<T = unknown> extends Request {
  body: T;
}
export interface TypedRequestParams<T extends ParamsDictionary> extends Request {
  params: T;
}
export interface TypedRequestQuery<T extends Query> extends Request {
  query: T;
}

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

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model('List', listSchema);

app.get('/', (req: Request, res: Response) => {
  Item.find().then((foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(() => {
        console.log('Successfully saved default items to DB.');
        res.redirect('/');
      });
    } else {
      res.render('list', { listTitle: 'Today', items: foundItems });
    }
  });
});

app.get('/:customListName', (req: TypedRequestParams<{ customListName: string }>, res: Response) => {
  const customListName = _.capitalize(req.params.customListName);
  const list = new List({
    name: customListName,
    items: defaultItems,
  });

  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        list.save().then(() => {
          console.log('Successfully saved default items to DB.');
          res.redirect(`/${customListName}`);
        });
      } else {
        res.render('list', { listTitle: foundList.name, items: foundList.items });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post('/', (req: TypedRequestBody<{ newItem: string; list: string }>, res: Response) => {
  const { newItem, list } = req.body;

  const item = new Item({
    name: newItem,
  });

  if (list === 'Today') {
    item.save().then(() => {
      res.redirect('/');
    });
  } else {
    List.findOne({ name: list })
      .then((foundList) => {
        if (foundList) {
          foundList.items.push(item);
          foundList.save().then(() => {
            res.redirect(`/${list}`);
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post('/delete', (req: TypedRequestBody<{ checkedItemId: string; listName: string }>, res: Response) => {
  const { checkedItemId, listName } = req.body;

  if (listName === 'Today') {
    Item.findByIdAndDelete(checkedItemId).then(() => {
      console.log('Successfully deleted checked item.');
      res.redirect('/');
    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }).then(() => {
      res.redirect(`/${listName}`);
    });
  }
});

app.get('/about', (req: Request, res: Response) => {
  res.render('about');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

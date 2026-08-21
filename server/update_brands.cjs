const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://varadmule17_db_user:YlGKnwW5vHWN1isK@vam.6n038fi.mongodb.net/ecommerce?appName=VAM')
  .then(() => mongoose.connection.db.collection('brands').updateMany(
    { slug: { $in: ['manyavar', 'peter-england', 'louis-philippe', 'raymond', 'nike', 'puma', 'adidas'] } }, 
    { $addToSet: { departmentIds: new mongoose.Types.ObjectId('6a79a37e0ff9e1300720e3b5') } }
  ))
  .then(r => { console.log(r); process.exit(0); })
  .catch(console.error);

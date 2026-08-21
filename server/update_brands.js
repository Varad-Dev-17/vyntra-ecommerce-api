const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/vyntra-ecommerce')
  .then(() => mongoose.connection.db.collection('brands').updateMany(
    { slug: { $in: ['manyavar', 'peter-england', 'louis-philippe', 'raymond', 'nike', 'puma', 'adidas'] } }, 
    { $addToSet: { departmentIds: new mongoose.Types.ObjectId('6a79a37e0ff9e1300720e3b5') } }
  ))
  .then(r => { console.log(r); process.exit(0); })
  .catch(console.error);

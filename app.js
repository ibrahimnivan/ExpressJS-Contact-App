const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts } = require('./utils/contact');
const { body, validationResult, check } = require('express-validator');

const session = require('express-session'); // untuk pembuatan session
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');



const app = express();
const port = 3000;


// CONFIGURASI FLASH
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 6000}, // 6 detik
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));
app.use(flash());

// EJS for templating engine
app.set('view engine', 'ejs');

// THIRD-PARTY MIDDLEWARE for layout
app.use(expressLayouts);

// BUILD-IN MIDDLEWARE 
app.use(express.static('public')); //for public staic file 
app.use(express.urlencoded({extended: true})); //digunakan untuk mengurai data formulir yang dikirim



// HALAMAN HOME
// routing ngga perlu menggunakan next() karena setelah dijalankan, ngga ngehang tapi berhenti
app.get('/', (req, res) => {

  const mahasiswa = [
    {
      nama: 'Shandika',
      email: 'sandhikagalih@gmail.com'
    },
    {
      nama: 'Erik Ahmad',
      email: 'erikahmad@gmail.com'
    },
    {
      nama: 'Doddy Ferdiansyah',
      email: 'doddyferdiansyah@gmail.com'
    },
  ]
  
  res.render('index', { 
    layout: 'layout/main-layout',
    nama: 'Ivan', 
    title: 'Halaman home', 
    mahasiswa})
})


//HALAMAN ABOUT
app.get('/about', (req, res) => {
  res.render('about', {
    layout: 'layout/main-layout', 
    title: 'Halaman about'})
})



// HALMAN CONTACT
// HALMAN CONTACT
app.get('/contact', (req, res) => {
  const contacts = loadContact();

  res.render('contact', { 
   layout: 'layout/main-layout',
   title: 'Halaman contact',
   contacts, // dari loadContact()
   msg: req.flash('msg'), // pesan saat sudah menambah, menghapus dan mengubah setelah redirect
  })  
})



// HALAMAN FORM TAMBAH DATA CONTACT
app.get('/contact/add', (req, res) => {
res.render('add-contact', {
  title: 'Form Tambah Data Contact',
  layout: 'layout/main-layout'
})
})


// PROCESS ACTION untuk mengirim data dari Form add-contact
app.post('/contact', [
  body('nama').custom((value) => {  // custom express-validator
    const duplikat = cekDuplikat(value);
    if(duplikat) {
      throw new Error('Nama contact sudah digunakan!')
    }
    return true; // katanya ini optional bisa dihapus
  }),
  check('email', 'Email tidak valid!').isEmail(), //check untuk custom 'msg' 'Email tidak valdi'
  check('noHP' , 'No HP tidak valid').isMobilePhone('id-ID') // 'noHP' sesuai aattribute name di form html
], (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    // return res.status(400).json({ errors: errors.array() });
    res.render('add-contact', {
      title: 'Form Tambah Data Contact',
      layout: 'layout/main-layout',
      errors: errors.array(), // jika nama, email, noHP error
    });
  } else {
    addContact(req.body); // untuk menambah dari form ke contact.json
    // kirimkan flash message
    req.flash('msg', 'Data contact berhasil ditambahkan!') // "msg" adalah bagian dari data JSON yang dikirim dalam tubuh permintaan POST
    res.redirect('/contact');
  }
})


// PROCESS DELETE CONTACT
// dengancara membuat data baru selain nama yg dipilih
app.get('/contact/delete/:nama', (req, res) => {
  const contact = findContact(req.params.nama);

  //jika contact tidak ada (agar tidak sembarang menulis di url)
  if(!contact) {
    res.status(404);
    res.send('404');
  } else {
    deleteContact(req.params.nama);
     // kirimkan flash message
     req.flash('msg', 'Data contact berhasil dihapus!')
     res.redirect('/contact');
  }
});



// HALAMAN UBAH DATA CONTACT
app.get('/contact/edit/:nama', (req, res) => {
  const contact = findContact(req.params.nama)

  res.render('edit-contact', {
    title: 'Form Ubah Data Contact',
    layout: 'layout/main-layout',
    contact, // dari findContact() menampilkan data sebelum diubah
  });
  });

// PROCESS UBAH DATA CONTACT
app.post('/contact/update', [
  body('nama').custom((value, { req }) => {
    const duplikat = cekDuplikat(value);
    if(value !== req.body.oldNama && duplikat) { //hidden-oldNama agar nama tidak duplikat saat hanya ingin mengedit email/noHP
      throw new Error('Nama contact sudah digunakan!')
    }
    return true;
  }),
  check('email', 'Email tidak valid!').isEmail(),
  check('noHP', 'No HP tidak valid').isMobilePhone('id-ID')
], (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    // return res.status(400).json({ errors: errors.array() });
    res.render('edit-contact', {
      title: 'Form Ubah Data Contact',
      layout: 'layout/main-layout',
      errors: errors.array(),
      contact: req.body,
    });
  } else {
    updateContacts(req.body);
    // kirimkan flash message
    req.flash('msg', 'Data contact berhasil diubah!'); //untuk halaman contact
    res.redirect('/contact');
  }
})

// HALAMAN DETAIL CONTACT
app.get('/contact/:nama', (req, res) => {
  const contact = findContact(req.params.nama);

  res.render('detail', { 
   layout: 'layout/main-layout',
   title: 'Halaman Detail Contact',
   contact,
  });  
});


// bisa dianggap ERROR MIDDLEWARE (tdk akan dijalankan jika route yg atas dijalankan, makannya ditaro dibawah)
app.use((req, res) => {
  res.status(404);
  res.send('<h1>404 Page not found<h1>');
});

//  digunakan untuk MEMULAI SERVER Express dan mengatur server untuk mendengarkan permintaan HTTP pada port yang ditentukan. 
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});


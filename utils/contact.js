const fs = require('fs')

// membuat folder data jika belum ada
const dirPath = './data';
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

// membuat file contacts.json jika belum ada
const dataPath = './data/contacts.json';
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, '[]', 'utf-8');
}


// ambil semua data di contact.json
const loadContact = () => {
  const fileBuffer = fs.readFileSync(dataPath, 'utf-8');
  const contacts = JSON.parse(fileBuffer);
  return contacts
};

// cari detail contact berdasarkan nama
const findContact = (nama) => {
  const contacts = loadContact();
  const contact = contacts.find((contact) => contact.nama === nama);
  return contact;
};

// menulis/menimpa file contacts.json dgn data yg baru
const saveContact = (contacts) => {
  fs.writeFileSync('data/contacts.json', JSON.stringify(contacts));
};

// menambahkan data contact baru
const addContact = (contact) => {
  const contacts = loadContact();
  contacts.push(contact);
  saveContact(contacts);
};

// cek nama duplikat
const cekDuplikat = (nama) => {
  const contacts = loadContact();
  return contacts.find((contact) => contact.nama === nama);
};

const deleteContact = (nama) => {
  const contacts = loadContact();
  const filteredContacts = contacts.filter((contact) => contact.nama !== nama);
  saveContact(filteredContacts);
}

// mengubah contact
const updateContacts = (contactBaru) => {
  const contacts = loadContact();
  // hilangkan contact lama yang namanya sama dengan oldNama
  const filteredContacts = contacts.filter((contact) => contact.nama !== contactBaru.oldNama);
  delete contactBaru.oldNama; // dihapus krn hanya dibutuhkan saat validasi
  filteredContacts.push(contactBaru);
  saveContact(filteredContacts);
}



module.exports = { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts };
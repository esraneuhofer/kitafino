module.exports.setLanguage = async (req, res, next) => {
  const { lang } = req.body;
  if (lang) {
    console.log('Language set to:', lang);
    res.cookie('lang', lang, { maxAge: 900000, httpOnly: true }); // Setzt ein Cookie mit der Sprachpräferenz
    res.status(200).send({ message: 'Language set successfully', isError: false });
  } else {
    console.log('Language set to:', "lang");

    res.status(400).send({ message: 'Language not provided', isError: true });
  }
}

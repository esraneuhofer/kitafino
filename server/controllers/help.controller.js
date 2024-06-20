const mongoose = require("mongoose");
const Help = mongoose.model('HelpSchema');
const fs = require('fs');
const path = require('path');


module.exports.getSingleHelpPdfBase = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const HelpModel = await Help.findOne({ 'routeName': req.query.routeName });
    // Sending the result back to the client
    res.json(HelpModel);
  } catch (err) {
    console.error('HelpModel:', err); // Log the error for debugging
    res.status(500).json({ message: 'HelpModel kann nciht gefuden werden', error: err.message });
  }
};


module.exports.getAllHelpPdfNames = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const HelpModel = await Help.find({},'nameFile routeName');
    // Sending the result back to the client
    res.json(HelpModel);
  } catch (err) {
    console.error('Vertragspartner Informationen:', err); // Log the error for debugging
    res.status(500).json({ message: 'Vertragspartner Informationen konnte nicht geladen werden', error: err.message });
  }
};



module.exports.addHelpImage = async (req, res) => {
  try {
    console.log('addHelpImage called');
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { nameFile, lang, filename, routeName } = req.body;
    console.log('Request body:', req.body);

    const pdfBuffer = req.file.buffer;
    const uploadsDir = path.join(__dirname, '../uploads'); // Verzeichnis relativ zum aktuellen Verzeichnis
    const pdfPath = path.join(uploadsDir, `${req.file.originalname}-${Date.now()}.pdf`);
    console.log('Generated pdfPath:', pdfPath);

    // Erstelle das Verzeichnis, falls es nicht existiert
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Speichere die Datei im Dateisystem
    fs.writeFile(pdfPath, pdfBuffer, async (err) => {
      if (err) {
        console.error('Failed to save file', err);
        return res.status(500).json({ error: 'Failed to save file' });
      }

      const newHelp = new Help({
        nameFile,
        lang,
        filename,
        routeName,
        pdfPath
      });

      try {
        const savedHelp = await newHelp.save();
        console.log('Help object saved successfully:', savedHelp);
        res.status(200).json(savedHelp);
      } catch (err) {
        console.error('Failed to save Help object', err);
        res.status(500).json({ error: err.message });
      }
    });
  } catch (error) {
    console.error('Error in addHelpImage:', error);
    res.status(500).json({ error: error.message });
  }
};


module.exports.downloadHelpImage = async (req, res) => {
  try {
    const help = await Help.findById(req.params.id);
    if (!help || !help.pdfPath) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.resolve(__dirname, '..', help.pdfPath);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ error: 'File not found on server' });
    }
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: error.message });
  }
};

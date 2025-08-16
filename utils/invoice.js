const PDFDocument = require('pdfkit');

const generateInvoice = (auctionData, userData, isForBuyer = true) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Invoice header
      doc.fontSize(20).text('AUCTION INVOICE', 50, 50);
      doc.fontSize(12).text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 80);
      
      // Auction details
      doc.text(`Auction: ${auctionData.title}`, 50, 120);
      doc.text(`Amount: $${auctionData.amount}`, 50, 140);
      doc.text(`Type: ${isForBuyer ? 'Purchase' : 'Sale'}`, 50, 160);
      
      // User details
      doc.text(`${isForBuyer ? 'Buyer' : 'Seller'}: ${userData.username}`, 50, 200);
      doc.text(`Email: ${userData.email}`, 50, 220);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoice };
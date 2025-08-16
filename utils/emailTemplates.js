const completedAuctionEmail = (auction, buyer, seller, isBuyer) => ({
  to: isBuyer ? buyer.email : seller.email,
  from: process.env.EMAIL_FROM,
  subject: `Auction ${isBuyer ? 'Win' : 'Completion'}: ${auction.title}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${isBuyer ? 'Congratulations!' : 'Auction Completed'}</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h3>${auction.title}</h3>
        <p><strong>Final Price:</strong> ${auction.currentBid}</p>
        <p><strong>${isBuyer ? 'Seller' : 'Buyer'}:</strong> ${isBuyer ? seller.username : buyer.username} (${isBuyer ? seller.email : buyer.email})</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <p>${isBuyer ? 'Please contact the seller to arrange payment and delivery.' : 'Please contact the buyer to arrange payment and delivery.'}</p>
    </div>
  `
});

module.exports = { completedAuctionEmail };

const confirmationTemplate = (buyerName, sellerName, auctionTitle, amount) => ({
  to: [
    { email: buyerName, name: 'Buyer' },
    { email: sellerName, name: 'Seller' }
  ],
  from: process.env.EMAIL_FROM || process.env.FROM_EMAIL,
  subject: `Auction Completed - ${auctionTitle}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Auction Completed Successfully!</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h3>${auctionTitle}</h3>
        <p><strong>Winning Bid:</strong> ${amount}</p>
        <p><strong>Buyer:</strong> ${buyerName}</p>
        <p><strong>Seller:</strong> ${sellerName}</p>
      </div>
      <p>Thank you for using our auction platform!</p>
    </div>
  `
});

const invoiceTemplate = (userEmail, auctionTitle, amount, isForBuyer = true) => ({
  to: userEmail,
  from: process.env.EMAIL_FROM || process.env.FROM_EMAIL,
  subject: `Invoice - ${auctionTitle}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${isForBuyer ? 'Purchase' : 'Sale'} Invoice</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h3>${auctionTitle}</h3>
        <p><strong>Amount:</strong> ${amount}</p>
        <p><strong>Type:</strong> ${isForBuyer ? 'Purchase' : 'Sale'}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <p>Please keep this for your records.</p>
    </div>
  `,
  attachments: [
    {
      content: 'invoice-pdf-content-here', // Would be replaced with actual PDF
      filename: `invoice-${Date.now()}.pdf`,
      type: 'application/pdf',
      disposition: 'attachment'
    }
  ]
});

module.exports = { confirmationTemplate, invoiceTemplate, completedAuctionEmail };
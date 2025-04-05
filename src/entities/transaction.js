export class Transaction {
    constructor(sender_email, recipient_email, amount, message = '', status = 'pending') {
        this.sender_email = sender_email;
        this.recipient_email = recipient_email;
        this.amount = amount;
        this.message = message;
        this.status = status;
    }
  }
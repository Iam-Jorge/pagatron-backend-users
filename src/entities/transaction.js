export class Transaction {
    constructor(id, sender_id, recipient_id, amount, message, status, created_at) {
      this.id = id;
      this.sender_id = sender_id;
      this.recipient_id = recipient_id;
      this.amount = amount;
      this.message = message;
      this.status = status;
      this.created_at = created_at;
    }
  }
  
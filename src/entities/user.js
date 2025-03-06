export class User {
    constructor(id, name, email, password_hash, role, created_at) {
      this.id = id;
      this.name = name;
      this.email = email;
      this.password_hash = password_hash;
      this.role = role;
      this.created_at = created_at;
    }
  }
  
import bcrypt from 'bcryptjs';

export const validatePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const validateEmail = (email) => {
  const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return regex.test(email);
};

export const emailExists = async (email, UserModel) => {
  const user = await UserModel.getUserByEmail(email);
  return user !== null;
};

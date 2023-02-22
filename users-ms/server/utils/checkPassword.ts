import bcrypt from "bcryptjs";

const checkPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    const result = await bcrypt.compare(password, hashedPassword);
    return result;
};

export default checkPassword;

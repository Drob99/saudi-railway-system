const bcrypt = require("bcrypt");

class Hasher {
  static async hash(password, saltRounds = 10) {
    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      console.error('Hashing error:', error);
      throw error;
    }
  }

  static async compare(password, hashedPassword) {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      console.error('Comparison error:', error);
      throw error;
    }
  }

  // Utility method to generate a salt
  static async generateSalt(rounds = 10) {
    try {
      const salt = await bcrypt.genSalt(rounds);
      return salt;
    } catch (error) {
      console.error('Salt generation error:', error);
      throw error;
    }
  }
}

module.exports = Hasher;
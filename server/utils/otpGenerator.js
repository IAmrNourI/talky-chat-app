exports.generateUniqueOtp = () => {
    let uniqueNumber = "";
    const digits = [];
  
    for (let i = 0; i < 10; i++) {
      digits.push(i);
    }
  
    for (let i = digits.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
  
    for (let i = 0; i < 6; i++) {
      uniqueNumber += digits[i];
    }
  
    if (uniqueNumber.length < 6) {
      const remainingDigits = 6 - uniqueNumber.length;
      for (let i = 0; i < remainingDigits; i++) {
        uniqueNumber += Math.floor(Math.random() * 10);
      }
    }
    return uniqueNumber;
  };
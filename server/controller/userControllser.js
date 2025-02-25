const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateUniqueOtp } = require("../utils/otpGenerator");
const transporter = require("../config/nodemailer");
const { trusted } = require("mongoose");

exports.register = async (req, res) => {
  try {
    const { name, email, password, profile_pic } = req.body;
    const isEmailExist = await User.findOne({ email: email });
    if (isEmailExist) {
      return res
        .status(400)
        .json({ message: "Email already exists", error: true });
    }

    const hashedPassword = await bcryptjs.hashSync(password, 12);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      profile_pic,
    });
    await user.save();

    const otp = generateUniqueOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "YOUR OTP CODE",
      // text: `Your OTP code is ${otp}`,
      html: `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your OTP Code</title>
  <style>
    /* Global Styles */
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table {
      border-spacing: 0;
      width: 100%;
    }

    table td {
      padding: 0;
    }

    img {
      border: 0;
    }

    /* Container Styles */
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    /* Header Styles */
    .header {
      text-align: center;
      padding: 20px;
    }

    .header img {
      max-width: 100px;
      height: auto;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      color: #333333;
    }

    /* OTP Code Section */
    .otp-code {
      text-align: center;
      padding: 30px 0;
      font-size: 32px;
      font-weight: bold;
      color: #333333;
      letter-spacing: 4px;
    }

    /* Message Section */
    .message {
      text-align: center;
      padding: 10px 30px;
      font-size: 18px;
      line-height: 1.6;
      color: #666666;
    }

    /* Button Styles */
    .button-container {
      text-align: center;
      padding: 30px 0;
    }

    .button {
      background-color: #4CAF50;
      color: #ffffff;
      padding: 15px 30px;
      border-radius: 5px;
      text-decoration: none;
      font-size: 18px;
    }

    .button:hover {
      background-color: #45a049;
    }

    /* Footer Styles */
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #999999;
    }

    .footer a {
      color: #4CAF50;
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    @media only screen and (max-width: 600px) {
      .container {
        width: 100%;
        padding: 15px;
      }

      .header h1 {
        font-size: 20px;
      }

      .otp-code {
        font-size: 28px;
      }

      .message {
        font-size: 16px;
      }

      .button {
        font-size: 16px;
        padding: 12px 25px;
      }
    }
  </style>
</head>

<body>
  <table role="presentation" class="container">
    <tr>
      <td class="header">
        <img src="https://yourdomain.com/logo.png" alt="Your Logo">
        <h1>Your One-Time Password (OTP)</h1>
      </td>
    </tr>
    <tr>
      <td class="otp-code">
        <!-- Insert OTP here -->
        ${otp}
      </td>
    </tr>
    <tr>
      <td class="message">
        Use the code above to complete your login. This code is valid for the next 10 minutes.
      </td>
    </tr>
    <tr>
      <td class="footer">
        If you didn't request this, please ignore this email or <a href="https://yourdomain.com/contact">contact support</a>.
        <br>
        &copy; 2024 Your Company. All rights reserved.
      </td>
    </tr>
  </table>
</body>

</html>
`,
    };

    const result = await transporter.sendMail(mailOptions);
    if (result.messageId) {
      return res
        .status(200)
        .json({ message: "OTP sent successfully", email, success: true });
    }
    return res.status(400).json({ message: "Failed to send OTP" });

    // res
    //   .status(201)
    //   .json({
    //     message: "User registered successfully",
    //     data: user,
    //     success: true,
    //   });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email: email, otp });
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "Invalid OTP" });
    }
    if (user.otpExpires < Date.now()) {
      return res.status(404).json({ message: "OTP expired" });
    }
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ message: "OTP verified successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const otp = generateUniqueOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "YOUR OTP CODE",
      // text: `Your OTP code is ${otp}`,
      html: `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your OTP Code</title>
  <style>
    /* Global Styles */
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table {
      border-spacing: 0;
      width: 100%;
    }

    table td {
      padding: 0;
    }

    img {
      border: 0;
    }

    /* Container Styles */
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    /* Header Styles */
    .header {
      text-align: center;
      padding: 20px;
    }

    .header img {
      max-width: 100px;
      height: auto;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      color: #333333;
    }

    /* OTP Code Section */
    .otp-code {
      text-align: center;
      padding: 30px 0;
      font-size: 32px;
      font-weight: bold;
      color: #333333;
      letter-spacing: 4px;
    }

    /* Message Section */
    .message {
      text-align: center;
      padding: 10px 30px;
      font-size: 18px;
      line-height: 1.6;
      color: #666666;
    }

    /* Button Styles */
    .button-container {
      text-align: center;
      padding: 30px 0;
    }

    .button {
      background-color: #4CAF50;
      color: #ffffff;
      padding: 15px 30px;
      border-radius: 5px;
      text-decoration: none;
      font-size: 18px;
    }

    .button:hover {
      background-color: #45a049;
    }

    /* Footer Styles */
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #999999;
    }

    .footer a {
      color: #4CAF50;
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    @media only screen and (max-width: 600px) {
      .container {
        width: 100%;
        padding: 15px;
      }

      .header h1 {
        font-size: 20px;
      }

      .otp-code {
        font-size: 28px;
      }

      .message {
        font-size: 16px;
      }

      .button {
        font-size: 16px;
        padding: 12px 25px;
      }
    }
  </style>
</head>

<body>
  <table role="presentation" class="container">
    <tr>
      <td class="header">
        <img src="https://yourdomain.com/logo.png" alt="Your Logo">
        <h1>Your One-Time Password (OTP)</h1>
      </td>
    </tr>
    <tr>
      <td class="otp-code">
        <!-- Insert OTP here -->
        ${otp}
      </td>
    </tr>
    <tr>
      <td class="message">
        Use the code above to complete your login. This code is valid for the next 10 minutes.
      </td>
    </tr>
    <tr>
      <td class="footer">
        If you didn't request this, please ignore this email or <a href="https://yourdomain.com/contact">contact support</a>.
        <br>
        &copy; 2024 Your Company. All rights reserved.
      </td>
    </tr>
  </table>
</body>

</html>
`,
    };

    const result = await transporter.sendMail(mailOptions);
    if (result.messageId) {
      return res
        .status(200)
        .json({ message: "OTP sent successfully", success: true });
    }
    return res.status(400).json({ message: "Failed to send OTP" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email }).select("-password");
    if (!user) {
      return res.status(400).json({ message: "user not found", error: true });
    }
    if (user.otp) {
      return res
        .status(401)
        .json({ message: "Pleaser verify your account first" });
    }
    return res.status(200).json({
      message: "User found",
      success: true,
      userId: user._id,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message, error: true });
  }
};

exports.verifyPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findById(userId);
    console.log(user.password);
    console.log(password);
    const checkPassword = await bcryptjs.compareSync(password, user.password);
    if (!checkPassword) {
      return res
        .status(400)
        .json({ message: "Invalid Credentials", error: true });
    }
    const payload = {
      id: user._id,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "2d",
    });

    const cookieOptions = {
      http: true,
      secure: true,
    };

    return res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({ message: "Login Successfully", success: true, token });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

exports.userDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    return res
      .status(200)
      .json({ message: "user found successfully", data: user });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

exports.logout = async (req, res) => {
  try {
    const cookieOptions = {
      http: true,
      secure: true,
    };

    return res
      .cookie("token", "", cookieOptions)
      .status(200)
      .json({ message: "Logged out", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, profile_pic } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, profile_pic },
      { new: true }
    );
    return res.status(200).json({
      message: "user updated successfully",
      data: updatedUser,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

exports.searchUser = async (req, res) => {
  try {
    const { search } = req.body;

    const query = new RegExp(search, "i", "g");

    const users = await User.find({
      $or: [{ name: query, email: query }],
    }).select("-password");

    return res.status(200).json({
      message: "all users",
      data: users,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
    });
  }
};

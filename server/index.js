const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const emailRouter = require("./routes/sendEmailRoute");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*"
}));

app.get("/", (req, res) => {
  res.send("EduIITia App Backend Running");
});

app.use("/api", emailRouter);
app.use("/api/payment", require("./routes/paymentRoute"));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port: ${process.env.PORT}`);
});

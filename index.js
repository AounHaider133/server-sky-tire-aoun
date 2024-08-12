require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const passport = require("passport");
const chatRoutes = require("./routes/chat");
const app = express();
const database = require("./database");
const PredefinedResponse = require("./models/PredefinedResponse");
const ChatUser = require("./models/ChatUser");

var corsOptions = {
  origin: process.env.REMOTE_CLIENT_URL,
  optionsSuccessStatus: 200,
  credentials: true,
};

//mongoose.connect("mongodb://localhost:27017/chatbot");

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(
  bodyParser.json({
    // Because Stripe needs the raw body, we compute it but only when hitting the Stripe callback URL.
    verify: function (req, res, buf) {
      var url = req.originalUrl;
      if (url.startsWith("/webhook/stripe")) {
        req.rawBody = buf.toString();
      }
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use("/api", chatRoutes);

const userRouter = require("./routes/userRouter");
const brandRouter = require("./routes/brandRouter");
const productRouter = require("./routes/productRouter");
const wireWheelPackageRouter = require("./routes/wireWheelPackageRouter");
const newsletterRouter = require("./routes/newsletterRouter");
const contactRouter = require("./routes/contactRouter");
const orderRouter = require("./routes/orderRouter");
const paymentConfirmationRouter = require("./routes/paymentConfirmationRouter");
const googleMerchantRouter = require("./routes/googleMerchantRouter");
const couponRouter = require("./routes/couponRouter");
const vehicleRouter = require("./routes/vehicleRouter");
const sizeRouter = require("./routes/sizeRouter");
require("./jobs/cleanupOrders");

database.on("error", console.error.bind(console, "MongoDB connection error:"));

app.get("/", (req, res) =>
  res.json({ message: "Welcome to Sky Tire App backend." })
);

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}!`)
);

app.use("/api/", userRouter);
app.use("/api/", brandRouter);
app.use("/api/", productRouter);
app.use("/api/", wireWheelPackageRouter);
app.use("/api/", newsletterRouter);
app.use("/api/", contactRouter);
app.use("/api/", orderRouter);
app.use("/api/", paymentConfirmationRouter);
app.use("/api/", googleMerchantRouter);
app.use("/api/", couponRouter);
app.use("/api/", vehicleRouter);
app.use("/api/", sizeRouter);

// Attach Socket.io to the HTTP server
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.REMOTE_CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

//CHATBOT CODE

io.on("connection", async (socket) => {
  console.log("New client connected");

  socket.on("sendMessage", async ({ message, email, messageType }) => {
    console.log("Message received:", { message, email, messageType });

    if (messageType) {
      const response = await PredefinedResponse.findOne({ type: messageType });
      socket.emit("receiveMessage", {
        response: response ? response.response : "No response found",
      });
    } else {
      // Here you would handle the custom user query and send a response
      socket.emit("receiveMessage", { response: "Response from AI" });
    }

    // Store the message in user's chat history
    await ChatUser.findOneAndUpdate(
      { email },
      { $push: { chatHistory: { sender: "bot", text: message } } }
    );
  });
});

//Change database url, store hardcoded responses, allow permission in cors

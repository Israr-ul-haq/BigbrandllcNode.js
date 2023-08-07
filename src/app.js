const express = require("express"),
  helmet = require("helmet"),
  xss = require("xss-clean"),
  cookieParser = require("cookie-parser"),
  mongoSanitize = require("express-mongo-sanitize"),
  compression = require("compression"),
  cors = require("cors"),
  passport = require("passport"),
  httpStatus = require("http-status"),
  config = require("./config/config"),
  morgan = require("./config/morgan"),
  { jwtStrategy } = require("./config/passport"),
  AnonymousStrategy = require("passport-anonymous"),
  { errorConverter, errorHandler } = require("./middlewares/error"),
  ApiError = require("./utils/ApiError"),
  path = require("path"),
  serveStatic = require("serve-static"),
  swaggerUi = require("swagger-ui-express"),
  expressOasGenerator = require("express-oas-generator"),
  httpContext = require("express-http-context");

const app = express();
expressOasGenerator.handleResponses(app, {});
if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(httpContext.middleware);

app.use(helmet());

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "img-src 'self' data: https://akeneo.bigbrandsllc.co"
  );
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(mongoSanitize());
app.use(compression());

app.options("*", cors());
app.use(
  cors({
    origin: ["https://akeneo.bigbrandsllc.co", "http://localhost:3000"],
    methods: "GET",
    optionsSuccessStatus: 200,
  })
);

app.use(passport.initialize());
passport.use(new AnonymousStrategy());
passport.use("jwt", jwtStrategy);
app.use(cookieParser());

const routes = require("./routes");
app.use("/api/v1", routes);

app.use(express.static(path.join(__dirname, "public")));

module.exports = {
  app,
};

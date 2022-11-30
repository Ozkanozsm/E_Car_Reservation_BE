"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan = require("morgan");
const user_1 = __importDefault(require("./routes/user"));
dotenv_1.default.config();
const app = (0, express_1.default)();
if (process.env.npm_lifecycle_event === "dev") {
    app.use(morgan("dev"));
}
else {
    app.use(morgan("combined"));
}
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("e-car reservation backend");
});
app.use("/user", user_1.default);
app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`);
});

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const web3_1 = __importDefault(require("web3"));
const constants_1 = require("../datas/constants");
const userRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
userRouter.get("/", (req, res) => {
    res.send("user router");
});
userRouter.get("/list/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield prisma.user.findUnique({
        where: {
            id: Number(id),
        },
    });
    res.json(user);
}));
userRouter.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { signature, address } = req.body;
    const web3 = new web3_1.default();
    let isValid = false;
    try {
        isValid = web3.eth.accounts.recover(constants_1.registerMessage, signature) === address;
    }
    catch (e) {
        console.log("error on parsing signature");
    }
    if (isValid) {
        const user = yield prisma.user.findUnique({
            where: {
                wallet_addr: address,
            },
        });
        if (user) {
            res.json(user);
        }
        else {
            const newUser = yield prisma.user.create({
                data: {
                    wallet_addr: address,
                },
            });
            res.json(newUser);
        }
    }
    else {
        res.status(400).json({ message: "invalid signature" });
    }
}));
exports.default = userRouter;

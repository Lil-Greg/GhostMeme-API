import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { apiKeyAuth } from "./middleware/apiKeyAuth";

const app = express();

const port = process.env.PORT || 3000;
const allowedOrigins = [
    "https://your-frontend.vercel.app", // production frontend
    "http://localhost:5173"             // dev frontend
];


app.use(express.json());
app.use(cors({
    /*
    commenting out bc any origin is allowed
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },*/
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.use(apiKeyAuth);

// Define the root path with a greeting message
app.get("/", (res: Response) => {
    res.json({ message: "Welcome to the Express + TypeScript Server!" });
});

// Start the Express server
app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}`);
});

// PRODUCTION MODE:
// module.exports(app);
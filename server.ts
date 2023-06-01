import express, { Request, Response } from "express";
import axios from "axios";
require("dotenv").config();

const app = express();
const port = 3000;

app.get("/user-stats", async (req: Request, res: Response) => {
	try {
		const { username, forked } = req.query;

		// We need a username input
		if (!username) {
			res.status(418).send({ message: "We need a username input!!" });
		}

		// Fetch user repostiory data
		const apiUrl = `https://api.github.com/users/${username}/repos`;
		const headers = {
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			"Content-Type": "application/json",
		};

		const response = await axios.get(apiUrl, { headers });

		res.status(200).send(response.data);
	} catch (error) {
		console.log("Error: ", error);
		res.status(418).send({ message: "error" });
	}
});

// // app.get("/", (req, res) => {
// app.get("/user-stats", async (req: Request, res: Response) => {
// 	try {
// 		const { username, forked } = req.query;
// 		// const { username } = req.body;

// 		// if (!username) {
// 		// 	res.status(418).send({ message: "We need a username input!!" });
// 		// }

// 		// res.status(200).send("Hello, world!");
// 		res.status(200).send(username);
// 	} catch (error) {
// 		res.status(418).send({ message: "We need a username input!!" });
// 	}
// });

app.listen(port, () => {
	console.log(`Server is running on port ${port}.`);
});

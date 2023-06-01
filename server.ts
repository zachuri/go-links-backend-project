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
		const apiUrl = `https://api.github.com/search/users?q=user:${username}`;
		// const apiUrl = `https://api.github.com/users/${username}/repos`;

		const headers = {
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			"Content-Type": "application/json",
		};

		const response = await axios.get(apiUrl, { headers });
		// const reposResponse = await axios.get(response.data.items[0].repos_url);

		const perPage = 300;
		const reposUrl = `https://api.github.com/users?q=user:${username}/repos&per_page=${perPage}`;
		const reposResponse = await axios.get(reposUrl);
		const totalCount = Object.keys(reposResponse.data).length;

		// const statsResponse = {
		//   totalCount: response.data.total_count,
		//   totalStargazers: /* calculated total stargazers */,
		//   totalForkCount: /* calculated total fork count */,
		//   averageSize: /* calculated average size */,
		//   languages: /* calculated language counts */,
		// };

		res.status(200).send("Total Count" + totalCount);
	} catch (error) {
		console.log("Error: ", error);
		res.status(418).send({ message: "error" });
	}
});


app.listen(port, () => {
	console.log(`Server is running on port ${port}.`);
});

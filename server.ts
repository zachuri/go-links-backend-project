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

		const headers = {
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			"Content-Type": "application/json",
		};

		const perPage = 100;
		const page = 1;
		const reposUrl = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;
		const reposResponse = await axios.get(reposUrl, { headers });
		const repositories = reposResponse.data;
		const totalCount = repositories.length;

		// obtain total stargazers from each repository
		let totalStargazers = 0;
		repositories.forEach((repo: { stargazers_count: number }) => {
			totalStargazers += repo.stargazers_count;
		});

		// calculate the average size
		let totalSize = 0;
		repositories.forEach((repo: { size: any }) => {
			totalSize += repo.size;
		});

		const averageSize = calculateAverageSize(totalSize, totalCount);

		const finalResponse = {
			totalCount: totalCount,
			totalStargazers: totalStargazers /* calculated total stargazers */,
			totalForkCount: "" /* calculated total fork count */,
			averageSize: averageSize /* calculated average size */,
			languages: "" /* calculated language counts */,
		};

		res.status(200).send(finalResponse);
	} catch (error) {
		console.log("Error: ", error);
		res.status(418).send({ message: "error" });
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}.`);
});

function calculateAverageSize(totalSize: number, totalCount: number) {
	const averageSizeBytes = totalSize / totalCount;

	if (averageSizeBytes < 1024) {
		return `${averageSizeBytes.toFixed(2)} KB`;
	} else if (averageSizeBytes < 1048576) {
		return `${(averageSizeBytes / 1024).toFixed(2)} MB`;
	} else {
		return `${(averageSizeBytes / 1048576).toFixed(2)} GB`;
	}
}

// // Fetch user repostiory data
// const apiUrl = `https://api.github.com/search/users?q=user:${username}`;
// // const apiUrl = `https://api.github.com/users/${username}/repos`;

// const headers = {
// 	Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
// 	"Content-Type": "application/json",
// };

// const response = await axios.get(apiUrl, { headers });
// // const reposResponse = await axios.get(response.data.items[0].repos_url);

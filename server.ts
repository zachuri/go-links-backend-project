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

		let totalStargazers = 0;
		let totalForkCount = 0;
		let totalSize = 0;
		let languages: string[] = [];
		repositories.forEach(
			(repo: {
				size: number;
				forks_count: number;
				stargazers_count: number;
				language: string;
			}) => {
				totalSize += repo.size;
				totalForkCount += repo.forks_count;
				totalStargazers += repo.stargazers_count;
				const repoLanguages = repo.language;
				languages = languages.concat(repoLanguages);
			}
		);

		// Obtain Average Size
		const averageSize = calculateAverageSize(totalSize, totalCount);

		// Obtain language count
		console.log(languages);
		const languageCounts = calculateLanguageCounts(languages);

		const finalResponse = {
			totalCount: totalCount,
			totalStargazers: totalStargazers /* calculated total stargazers */,
			totalForkCount: totalForkCount /* calculated total fork count */,
			averageSize: averageSize /* calculated average size */,
			languages: languageCounts /* calculated language counts */,
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

function calculateLanguageCounts(languages: string[]) {
	const languageCounts: { [key: string]: number } = {};

	languages.forEach(language => {
		if (languageCounts[language]) {
			languageCounts[language]++;
		} else {
			languageCounts[language] = 1;
		}
	});

	// Convert language counts to array of objects
	const languageCountsArray = Object.entries(languageCounts).map(
		([language, count]) => ({ language, count })
	);

	// Sort languages by count in descending order
	const sortedLanguages = languageCountsArray.sort((a, b) => b.count - a.count);

	return sortedLanguages;
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

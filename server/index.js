const express = require("express");
const cors = require("cors");

var elasticsearch = require("@elastic/elasticsearch");

const app = express();

var client = new elasticsearch.Client({
  node: "http://localhost:9200",
});

app.use(cors());

const parseElasticResponse = (elasticResponse) => {
  const responseHits = elasticResponse.hits.hits;
  const result = responseHits.map((hit) => hit._source);
  return result;
};

app.get("/elastic", async (req, res, next) => {
  try {
    const { text = "" } = req.query;
    const response = await client.search(
      {
        index: "zips",
        from: 0,
        body: {
          query: {
            multi_match: {
              query: text,
              fields: ["city", "state", "id"],
              type: "phrase_prefix",
            },
          },
        },
      },
      {
        ignore: [404],
        maxRetries: 3,
      }
    );
    res.json({
      message: "Searched Successfully",
      records: response,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

app.listen(3030, () => {
  console.log("Server is running on port 3030");
});

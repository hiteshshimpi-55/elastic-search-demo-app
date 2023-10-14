var elasticsearch = require("@elastic/elasticsearch");
const fs = require("fs");

var client = new elasticsearch.Client({
  node: "http://localhost:9200",
});

async function run() {
  await client.indices.create(
    {
      index: "zip",
      body: {
        mappings: {
          properties: {
            id: { type: "keyword" },
            city: { type: "keyword" },
            state: { type: "keyword" },
            pop: { type: "integer" },
          },
        },
      },
    },
    { ignore: [400] }
  );

  const jsonContent = fs.readFileSync(`${__dirname}/data.json`, "utf-8");

  const dataset = JSON.parse(jsonContent).dataset;

  const body = dataset.flatMap((doc) => [
    { index: { _index: "zips" } },
    {
      state: doc.state,
      city: doc.city,
      id: doc._id,
      pop: doc.pop,
      loc: doc.loc,
    },
  ]);

  const bulkResponse = await client.bulk({ refresh: true, body });

  if (bulkResponse.errors) {
    const erroredDocuments = [];

    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0];
      if (action[operation].error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1],
        });
      }
    });
    console.log(erroredDocuments);
  }
}

run().catch(console.log);

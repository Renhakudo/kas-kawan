async function testLocalApi() {
  const res = await fetch("http://localhost:3000/api/parse-voice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transcript: "tes" }),
  });
  console.log("Status:", res.status);
  console.log("Text:", await res.text());
}
testLocalApi();

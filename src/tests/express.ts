import * as express from "express";
import {Server} from "http";
import * as fs from "fs";
import * as path from "path";

const app = express();
let httpServer: Server;

const exampleHtml = fs.readFileSync(path.resolve(__dirname, "example.html")).toString("utf-8");

function defaultMiddleware(response: express.Response, status: number) {
  response.cookie("test1", "someId", {
    domain: "foo.example.com",
    expires: new Date("2024-04-03T14:04:00.000Z"),
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: true
  });

  response.cookie("test2", "someId", {
    domain: "foo.example.com",
    expires: new Date("2024-04-03T14:04:00.000Z"),
    httpOnly: false,
    path: "/docs",
    sameSite: "lax",
    secure: false
  });

  response.status(status);

  return response.send(exampleHtml);
}

app.get("/200", (req, res) => defaultMiddleware(res, 200));
app.get("/302", (req, res) => {
  res.setHeader("location", "/200");
  return defaultMiddleware(res, 302);
});
app.get("/404", (req, res) => defaultMiddleware(res, 404));
app.get("/500", (req, res) => defaultMiddleware(res, 500));

export async function startServer() {
  let promiseResolver: (value: unknown) => void;
  const serverReady = new Promise((resolve) => promiseResolver = resolve);
  httpServer = app.listen(promiseResolver);
  await serverReady;


  const address = httpServer.address();
  if (typeof address === "string") {
    throw new Error("Server address format unexpected!");
  }

  return address.port;
}

export async function stopServer() {
  return await new Promise<void>((resolve) => httpServer.close(() => resolve()));
}
